const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('./sendOtpMail.js');
const { pool, initDatabase } = require('./db.js');

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
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = userResult.rows[0];

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
        email: user.email
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 