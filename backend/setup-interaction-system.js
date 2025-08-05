const { pool, initDatabase } = require('./db.js');

const setupInteractionSystem = async () => {
  try {
    console.log('Setting up interaction system database tables...');
    
    // Initialize the database with new tables
    await initDatabase();
    
    console.log('✅ Interaction system database setup completed successfully!');
    console.log('\n📊 Database Tables Created:');
    console.log('   - users (existing)');
    console.log('   - blog_posts (updated)');
    console.log('   - likes (new)');
    console.log('   - comments (new)');
    console.log('   - views (new)');
    
    console.log('\n🔗 API Endpoints Available:');
    console.log('   POST /api/blogs/:id/like - Like/Unlike a blog');
    console.log('   GET /api/blogs/:id/like-status - Check like status');
    console.log('   POST /api/blogs/:id/comment - Add a comment');
    console.log('   GET /api/blogs/:id/comments - Get comments');
    console.log('   DELETE /api/comments/:id - Delete a comment');
    console.log('   POST /api/blogs/:id/view - Record a view');
    console.log('   GET /api/user/dashboard/:userId - Get user dashboard stats');
    console.log('   GET /api/blogs/:id/stats - Get blog stats');
    
    console.log('\n💡 Features:');
    console.log('   - User authentication required for likes and comments');
    console.log('   - Session-based view tracking (prevents duplicate views)');
    console.log('   - Real-time stats updates');
    console.log('   - User dashboard with comprehensive analytics');
    
  } catch (error) {
    console.error('❌ Error setting up interaction system:', error);
  } finally {
    process.exit(0);
  }
};

setupInteractionSystem(); 