const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Create users table if it doesn't exist
const createUsersTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        banned BOOLEAN DEFAULT FALSE,
        banned_at TIMESTAMP NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('Users table created or already exists');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

// Create blog posts table if it doesn't exist
const createBlogPostsTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('Blog posts table created or already exists');
  } catch (error) {
    console.error('Error creating blog posts table:', error);
  }
};

// Create likes table for tracking user likes
const createLikesTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('Likes table created or already exists');
  } catch (error) {
    console.error('Error creating likes table:', error);
  }
};

// Create comments table for tracking user comments
const createCommentsTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('Comments table created or already exists');
  } catch (error) {
    console.error('Error creating comments table:', error);
  }
};

// Create views table for tracking blog views
const createViewsTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS views (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ip_address VARCHAR(45),
        session_id VARCHAR(255),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, session_id)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('Views table created or already exists');
  } catch (error) {
    console.error('Error creating views table:', error);
  }
};

// Initialize database
const initDatabase = async () => {
  await createUsersTable();
  await createBlogPostsTable();
  await createLikesTable();
  await createCommentsTable();
  await createViewsTable();
};

// Helper function to get blog statistics
const getBlogStats = async (blogId) => {
  try {
    // Get likes count
    const likesResult = await pool.query(
      'SELECT COUNT(*) as likes_count FROM likes WHERE blog_id = $1',
      [blogId]
    );
    
    // Get views count
    const viewsResult = await pool.query(
      'SELECT COUNT(*) as views_count FROM views WHERE blog_id = $1',
      [blogId]
    );
    
    // Get comments count
    const commentsResult = await pool.query(
      'SELECT COUNT(*) as comments_count FROM comments WHERE blog_id = $1',
      [blogId]
    );
    
    return {
      likes: parseInt(likesResult.rows[0].likes_count),
      views: parseInt(viewsResult.rows[0].views_count),
      comments: parseInt(commentsResult.rows[0].comments_count)
    };
  } catch (error) {
    console.error('Error getting blog stats:', error);
    return { likes: 0, views: 0, comments: 0 };
  }
};

// Helper function to get user dashboard stats
const getUserDashboardStats = async (userId) => {
  try {
    // Get user's blogs
    const blogsResult = await pool.query(
      'SELECT id, title, created_at FROM blog_posts WHERE author_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const blogs = blogsResult.rows;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    
    // Calculate stats for each blog
    const blogsWithStats = await Promise.all(
      blogs.map(async (blog) => {
        const stats = await getBlogStats(blog.id);
        totalViews += stats.views;
        totalLikes += stats.likes;
        totalComments += stats.comments;
        
        return {
          id: blog.id,
          title: blog.title,
          created_at: blog.created_at,
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments
        };
      })
    );
    
    return {
      totalBlogs: blogs.length,
      totalViews,
      totalLikes,
      totalComments,
      blogs: blogsWithStats
    };
  } catch (error) {
    console.error('Error getting user dashboard stats:', error);
    return {
      totalBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      blogs: []
    };
  }
};

module.exports = {
  pool,
  initDatabase,
  getBlogStats,
  getUserDashboardStats
}; 