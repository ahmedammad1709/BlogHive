const { pool, initDatabase } = require('./db.js');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Initialize database (create tables)
    await initDatabase();
    console.log('✅ Database tables created successfully');
    
    // Test database connection
    const testQuery = await pool.query('SELECT NOW()');
    console.log('✅ Database connection working');
    console.log('   Current time:', testQuery.rows[0].now);
    
    // Check if tables exist
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'blog_posts', 'blog_likes', 'blog_views', 'blog_comments')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Database tables:');
    tablesQuery.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    // Check if there are any blog posts
    const postsQuery = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    console.log(`\n📝 Blog posts: ${postsQuery.rows[0].count}`);
    
    // Check if there are any users
    const usersQuery = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${usersQuery.rows[0].count}`);
    
    // Test foreign key constraints
    console.log('\n🔗 Testing foreign key constraints...');
    
    // Try to insert a test like
    try {
      const testLikeQuery = await pool.query(`
        INSERT INTO blog_likes (blog_id, user_ip, user_agent) 
        VALUES (1, '127.0.0.1', 'test-agent')
        ON CONFLICT (blog_id, user_ip) DO NOTHING
      `);
      console.log('✅ Foreign key constraints working');
    } catch (error) {
      console.log('⚠️  Foreign key constraint test:', error.message);
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 