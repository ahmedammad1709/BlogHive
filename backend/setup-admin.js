const { pool } = require('./db.js');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Delete the user with email "ttorfidoo001@gmail.com"
    const deleteResult = await pool.query('DELETE FROM users WHERE email = $1', ['ttorfidoo001@gmail.com']);
    console.log('Deleted user:', deleteResult.rowCount, 'rows affected');
    
    // Hash the admin password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('@4240190162473A', saltRounds);
    
    // Create admin user
    const adminQuery = `
      INSERT INTO users (name, email, password, banned) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email
    `;
    
    const adminResult = await pool.query(adminQuery, [
      'Admin User',
      'ttorfidoo001@gmail.com',
      hashedPassword,
      false
    ]);
    
    console.log('Admin user created successfully:', adminResult.rows[0]);
    
    // Add admin field to users table if it doesn't exist
    const adminFieldCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin'");
    
    if (adminFieldCheck.rows.length === 0) {
      console.log('Adding is_admin field to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      console.log('is_admin field added successfully!');
    }
    
    // Update the admin user to have is_admin = true
    await pool.query('UPDATE users SET is_admin = true WHERE email = $1', ['ttorfidoo001@gmail.com']);
    console.log('Admin privileges granted to user');
    
    pool.end();
  } catch (error) {
    console.error('Error setting up admin:', error);
    pool.end();
  }
}

setupAdmin(); 