const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('./sendOtpMail.js');
const { pool, initDatabase, getBlogStats, getUserDashboardStats } = require('./db.js');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store OTPs and pending users temporarily (in production, use Redis or database)
const otpStore = new Map();
const pendingUsers = new Map();

// Initialize database
initDatabase();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, fullName, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP with email and timestamp (5 minutes expiry)
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Store pending user data
    pendingUsers.set(email, {
      fullName,
      email,
      password,
      timestamp: Date.now()
    });

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
});

// Verify OTP and create user endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const storedData = otpStore.get(email);
    const pendingUser = pendingUsers.get(email);
    
    if (!storedData || !pendingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or not found. Please request a new OTP.' 
      });
    }

    // Check if OTP is expired (5 minutes)
    const now = Date.now();
    const otpAge = now - storedData.timestamp;
    const fiveMinutes = 5 * 60 * 1000;

    if (otpAge > fiveMinutes) {
      otpStore.delete(email);
      pendingUsers.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Check if too many attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      pendingUsers.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (storedData.otp === otp) {
      try {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pendingUser.password, saltRounds);
        
        // Insert user into database
        const insertQuery = `
          INSERT INTO users (name, email, password) 
          VALUES ($1, $2, $3) 
          RETURNING id, name, email
        `;
        
        const result = await pool.query(insertQuery, [
          pendingUser.fullName,
          pendingUser.email,
          hashedPassword
        ]);

        // Clean up stored data
        otpStore.delete(email);
        pendingUsers.delete(email);

        res.json({ 
          success: true, 
          message: 'Account created successfully',
          user: {
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email
          }
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        if (dbError.code === '23505') { // Unique constraint violation
          res.status(400).json({ 
            success: false, 
            message: 'User with this email already exists' 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Failed to create account. Please try again.' 
          });
        }
      }
    } else {
      // Increment attempts
      storedData.attempts += 1;
      otpStore.set(email, storedData);
      
      res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const userQuery = 'SELECT id, name, email, password, banned, banned_at, is_admin FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = userResult.rows[0];

    // Check if user is banned
    if (user.banned) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been banned by the administrator. Please contact admin for support.' 
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin || false
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Cleanup expired OTPs and pending users every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  for (const [email, data] of otpStore.entries()) {
    if (now - data.timestamp > fiveMinutes) {
      otpStore.delete(email);
    }
  }

  for (const [email, data] of pendingUsers.entries()) {
    if (now - data.timestamp > fiveMinutes) {
      pendingUsers.delete(email);
    }
  }
}, 5 * 60 * 1000);

// Create blog post endpoint
app.post('/api/blog-posts', async (req, res) => {
  try {
    const { title, description, category, authorId, authorName } = req.body;
    
    if (!title || !description || !category || !authorId || !authorName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Insert blog post into database
    const insertQuery = `
      INSERT INTO blog_posts (title, description, category, author_id, author_name) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, title, description, category, author_id, author_name, created_at
    `;
    
    const result = await pool.query(insertQuery, [
      title,
      description,
      category,
      authorId,
      authorName
    ]);

    res.json({ 
      success: true, 
      message: 'Blog post created successfully',
      post: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create blog post. Please try again.' 
    });
  }
});

// Get all blog posts endpoint
app.get('/api/blog-posts', async (req, res) => {
  try {
    const query = `
      SELECT 
        bp.id,
        bp.title,
        bp.description,
        bp.category,
        bp.author_id,
        bp.author_name,
        bp.status,
        bp.created_at,
        u.name as author_full_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      ORDER BY bp.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    // Get stats for each blog post
    const postsWithStats = await Promise.all(
      result.rows.map(async (post) => {
        const stats = await getBlogStats(post.id);
        return {
          ...post,
          views: stats.views,
          likes: stats.likes,
          comments_count: stats.comments
        };
      })
    );
    
    res.json({ 
      success: true, 
      posts: postsWithStats 
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch blog posts.' 
    });
  }
});

// Get blog posts by author endpoint
app.get('/api/blog-posts/author/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    
    const query = `
      SELECT 
        bp.id,
        bp.title,
        bp.description,
        bp.category,
        bp.author_id,
        bp.author_name,
        bp.status,
        bp.created_at,
        u.name as author_full_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.author_id = $1
      ORDER BY bp.created_at DESC
    `;
    
    const result = await pool.query(query, [authorId]);
    
    // Get stats for each blog post
    const postsWithStats = await Promise.all(
      result.rows.map(async (post) => {
        const stats = await getBlogStats(post.id);
        return {
          ...post,
          views: stats.views,
          likes: stats.likes,
          comments_count: stats.comments
        };
      })
    );
    
    res.json({ 
      success: true, 
      posts: postsWithStats 
    });

  } catch (error) {
    console.error('Error fetching author blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch blog posts.' 
    });
  }
});



// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};





// Update blog post endpoint
app.put('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, and category are required' 
      });
    }
    
    const query = `
      UPDATE blog_posts 
      SET title = $1, description = $2, category = $3, updated_at = NOW()
      WHERE id = $4 
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, description, category, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Blog post updated successfully',
      post: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update blog post.' 
    });
  }
});

// Delete blog post endpoint
app.delete('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      DELETE FROM blog_posts 
      WHERE id = $1 
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete blog post.' 
    });
  }
});

// Admin endpoints

// Get admin statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get total blogs
    const totalBlogsResult = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    const totalBlogs = parseInt(totalBlogsResult.rows[0].count);

    // Get banned users
    const bannedUsersResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE banned = true');
    const bannedUsers = parseInt(bannedUsersResult.rows[0].count);

    // Get total likes
    const totalLikesResult = await pool.query('SELECT COALESCE(SUM(likes), 0) as total FROM blog_posts');
    const totalLikes = parseInt(totalLikesResult.rows[0].total);

    // Get total views
    const totalViewsResult = await pool.query('SELECT COALESCE(SUM(views), 0) as total FROM blog_posts');
    const totalViews = parseInt(totalViewsResult.rows[0].total);

    // Get daily posts for last 7 days
    const dailyPostsQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM blog_posts 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    const dailyPostsResult = await pool.query(dailyPostsQuery);
    const dailyPosts = dailyPostsResult.rows;

    // Get user signups for last 30 days
    const userSignupsQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    const userSignupsResult = await pool.query(userSignupsQuery);
    const userSignups = userSignupsResult.rows;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBlogs,
        bannedUsers,
        totalLikes,
        totalViews
      },
      dailyPosts,
      userSignups
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch admin statistics.' 
    });
  }
});

// Get all users for admin
app.get('/api/admin/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.banned,
        u.banned_at,
        u.created_at,
        u.is_admin,
        COUNT(bp.id) as posts_count
      FROM users u
      LEFT JOIN blog_posts bp ON u.id = bp.author_id
      GROUP BY u.id, u.name, u.email, u.banned, u.banned_at, u.created_at, u.is_admin
      ORDER BY u.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({ 
      success: true, 
      users: result.rows 
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users.' 
    });
  }
});

// Ban user
app.put('/api/admin/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE users 
      SET banned = true, banned_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'User banned successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to ban user.' 
    });
  }
});

// Unban user
app.put('/api/admin/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE users 
      SET banned = false, banned_at = NULL
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'User unbanned successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unban user.' 
    });
  }
});

// Get all blogs for admin
app.get('/api/admin/blogs', async (req, res) => {
  try {
    const query = `
      SELECT 
        bp.id,
        bp.title,
        bp.description,
        bp.category,
        bp.views,
        bp.likes,
        bp.created_at,
        u.name as author_name,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      ORDER BY bp.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({ 
      success: true, 
      blogs: result.rows 
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch blogs.' 
    });
  }
});

// Delete blog (admin)
app.delete('/api/admin/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      DELETE FROM blog_posts 
      WHERE id = $1 
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete blog post.' 
    });
  }
});

// ========== INTERACTION SYSTEM ROUTES ==========

// Like/Unlike a blog post
app.post('/api/blogs/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Check if blog exists
    const blogCheck = await pool.query('SELECT id FROM blog_posts WHERE id = $1', [id]);
    if (blogCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user already liked this blog
    const existingLike = await pool.query(
      'SELECT id FROM likes WHERE blog_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (existingLike.rows.length > 0) {
      // Unlike: remove the like
      await pool.query(
        'DELETE FROM likes WHERE blog_id = $1 AND user_id = $2',
        [id, userId]
      );
      
      const stats = await getBlogStats(id);
      res.json({ 
        success: true, 
        message: 'Blog unliked successfully',
        liked: false,
        stats
      });
    } else {
      // Like: add the like
      await pool.query(
        'INSERT INTO likes (blog_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      
      const stats = await getBlogStats(id);
      res.json({ 
        success: true, 
        message: 'Blog liked successfully',
        liked: true,
        stats
      });
    }
    
  } catch (error) {
    console.error('Error handling like:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to handle like.' 
    });
  }
});

// Check if user liked a blog post
app.get('/api/blogs/:id/like-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    const result = await pool.query(
      'SELECT id FROM likes WHERE blog_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    res.json({ 
      success: true, 
      liked: result.rows.length > 0
    });
    
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check like status.' 
    });
  }
});

// Add a comment to a blog post
app.post('/api/blogs/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, commentText } = req.body;
    
    if (!userId || !commentText) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and comment text are required' 
      });
    }
    
    if (commentText.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment text cannot be empty' 
      });
    }
    
    // Check if blog exists
    const blogCheck = await pool.query('SELECT id FROM blog_posts WHERE id = $1', [id]);
    if (blogCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Add the comment
    const result = await pool.query(
      'INSERT INTO comments (blog_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [id, userId, commentText.trim()]
    );
    
    const newComment = result.rows[0];
    const stats = await getBlogStats(id);
    
    res.json({ 
      success: true, 
      message: 'Comment added successfully',
      comment: {
        id: newComment.id,
        comment_text: newComment.comment_text,
        author_name: userCheck.rows[0].name,
        created_at: newComment.created_at
      },
      stats
    });
    
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add comment.' 
    });
  }
});

// Get comments for a blog post
app.get('/api/blogs/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        c.id,
        c.comment_text,
        c.created_at,
        u.name as author_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = $1
      ORDER BY c.created_at DESC
    `, [id]);
    
    res.json({ 
      success: true, 
      comments: result.rows 
    });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch comments.' 
    });
  }
});

// Delete a comment (only by the comment author)
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Check if comment exists and belongs to user
    const commentCheck = await pool.query(
      'SELECT id, blog_id FROM comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found or you are not authorized to delete it' 
      });
    }
    
    // Delete the comment
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    
    const stats = await getBlogStats(commentCheck.rows[0].blog_id);
    
    res.json({ 
      success: true, 
      message: 'Comment deleted successfully',
      stats
    });
    
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete comment.' 
    });
  }
});

// Record a view for a blog post
app.post('/api/blogs/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, sessionId } = req.body;
    
    // Check if blog exists
    const blogCheck = await pool.query('SELECT id FROM blog_posts WHERE id = $1', [id]);
    if (blogCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    // Check if view already exists for this session
    const existingView = await pool.query(
      'SELECT id FROM views WHERE blog_id = $1 AND session_id = $2',
      [id, sessionId]
    );
    
    if (existingView.rows.length === 0) {
      // Record the view
      await pool.query(
        'INSERT INTO views (blog_id, user_id, session_id) VALUES ($1, $2, $3)',
        [id, userId || null, sessionId]
      );
    }
    
    const stats = await getBlogStats(id);
    
    res.json({ 
      success: true, 
      message: 'View recorded successfully',
      stats
    });
    
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record view.' 
    });
  }
});

// Get user dashboard stats
app.get('/api/user/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const dashboardStats = await getUserDashboardStats(userId);
    
    res.json({ 
      success: true, 
      stats: dashboardStats
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats.' 
    });
  }
});

// Get blog stats
app.get('/api/blogs/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if blog exists
    const blogCheck = await pool.query('SELECT id FROM blog_posts WHERE id = $1', [id]);
    if (blogCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }
    
    const stats = await getBlogStats(id);
    
    res.json({ 
      success: true, 
      stats
    });
    
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch blog stats.' 
    });
  }
});

// Delete user account
app.delete('/api/user/delete-account', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and password are required' 
      });
    }
    
    // Check if user exists and verify password
    const userCheck = await pool.query('SELECT id, password FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const user = userCheck.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }
    
    // Start a transaction to delete all user data
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete user's blog posts
      await client.query('DELETE FROM blog_posts WHERE author_id = $1', [userId]);
      
      // Delete user's likes
      await client.query('DELETE FROM likes WHERE user_id = $1', [userId]);
      
      // Delete user's comments
      await client.query('DELETE FROM comments WHERE user_id = $1', [userId]);
      
      // Delete user's views
      await client.query('DELETE FROM views WHERE user_id = $1', [userId]);
      
      // Finally delete the user
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      
      await client.query('COMMIT');
      
      res.json({ 
        success: true, 
        message: 'Account deleted successfully' 
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete account. Please try again.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 