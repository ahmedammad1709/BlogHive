# BlogHive Interaction System

## Overview

The BlogHive Interaction System provides a complete solution for handling likes, comments, and views on blog posts with proper user authentication and database tracking.

## Database Schema

### Tables

1. **users** (existing)
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR)
   - `email` (VARCHAR UNIQUE)
   - `password` (VARCHAR)
   - `created_at` (TIMESTAMP)

2. **blog_posts** (updated)
   - `id` (SERIAL PRIMARY KEY)
   - `title` (VARCHAR)
   - `description` (TEXT)
   - `category` (VARCHAR)
   - `author_id` (INTEGER REFERENCES users(id))
   - `author_name` (VARCHAR)
   - `status` (VARCHAR)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

3. **likes** (new)
   - `id` (SERIAL PRIMARY KEY)
   - `blog_id` (INTEGER REFERENCES blog_posts(id))
   - `user_id` (INTEGER REFERENCES users(id))
   - `created_at` (TIMESTAMP)
   - UNIQUE(blog_id, user_id)

4. **comments** (new)
   - `id` (SERIAL PRIMARY KEY)
   - `blog_id` (INTEGER REFERENCES blog_posts(id))
   - `user_id` (INTEGER REFERENCES users(id))
   - `comment_text` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

5. **views** (new)
   - `id` (SERIAL PRIMARY KEY)
   - `blog_id` (INTEGER REFERENCES blog_posts(id))
   - `user_id` (INTEGER REFERENCES users(id))
   - `ip_address` (VARCHAR)
   - `session_id` (VARCHAR)
   - `user_agent` (TEXT)
   - `created_at` (TIMESTAMP)
   - UNIQUE(blog_id, session_id)

## API Endpoints

### Likes

#### POST /api/blogs/:id/like
Like or unlike a blog post.

**Request Body:**
```json
{
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog liked successfully",
  "liked": true,
  "stats": {
    "likes": 5,
    "views": 25,
    "comments": 3
  }
}
```

#### GET /api/blogs/:id/like-status?userId=123
Check if a user has liked a blog post.

**Response:**
```json
{
  "success": true,
  "liked": true
}
```

### Comments

#### POST /api/blogs/:id/comment
Add a comment to a blog post.

**Request Body:**
```json
{
  "userId": 123,
  "commentText": "Great article!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": 1,
    "comment_text": "Great article!",
    "author_name": "John Doe",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "stats": {
    "likes": 5,
    "views": 25,
    "comments": 4
  }
}
```

#### GET /api/blogs/:id/comments
Get all comments for a blog post.

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": 1,
      "comment_text": "Great article!",
      "author_name": "John Doe",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### DELETE /api/comments/:id
Delete a comment (only by the comment author).

**Request Body:**
```json
{
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "stats": {
    "likes": 5,
    "views": 25,
    "comments": 3
  }
}
```

### Views

#### POST /api/blogs/:id/view
Record a view for a blog post.

**Request Body:**
```json
{
  "userId": 123,
  "sessionId": "session_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "View recorded successfully",
  "stats": {
    "likes": 5,
    "views": 26,
    "comments": 3
  }
}
```

### Dashboard Stats

#### GET /api/user/dashboard/:userId
Get comprehensive dashboard stats for a user.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBlogs": 5,
    "totalViews": 1250,
    "totalLikes": 45,
    "totalComments": 12,
    "blogs": [
      {
        "id": 1,
        "title": "My First Blog",
        "created_at": "2024-01-01T12:00:00Z",
        "views": 250,
        "likes": 10,
        "comments": 3
      }
    ]
  }
}
```

#### GET /api/blogs/:id/stats
Get stats for a specific blog post.

**Response:**
```json
{
  "success": true,
  "stats": {
    "likes": 5,
    "views": 25,
    "comments": 3
  }
}
```

## Frontend Integration

### Explore Page Features

1. **Like/Unlike Posts**
   - Heart icon toggles like status
   - Only logged-in users can like
   - Real-time count updates

2. **Comment System**
   - Comment form for logged-in users
   - Real-time comment display
   - Comment deletion for authors

3. **View Tracking**
   - Automatic view recording on page load
   - Session-based tracking prevents duplicates
   - Real-time view count updates

### Dashboard Features

1. **Overview Tab**
   - Total blogs count
   - Total likes received
   - Total comments received
   - Total views across all blogs
   - Recent activity with individual blog stats

2. **Real-time Updates**
   - Auto-refresh every 30 seconds
   - Manual refresh button
   - Live stats updates

## Setup Instructions

1. **Database Setup**
   ```bash
   cd backend
   node setup-interaction-system.js
   ```

2. **Start the Server**
   ```bash
   cd backend
   npm start
   ```

3. **Frontend Integration**
   - The explore page automatically uses the new API
   - Dashboard shows comprehensive user stats
   - All interactions require user authentication

## Security Features

1. **User Authentication**
   - All like/comment operations require user ID
   - Session-based view tracking
   - Comment deletion restricted to authors

2. **Duplicate Prevention**
   - Unique constraints on likes (user can only like once)
   - Session-based view tracking prevents duplicate views
   - Database-level constraints ensure data integrity

3. **Data Validation**
   - Server-side validation for all inputs
   - Proper error handling and responses
   - SQL injection prevention through parameterized queries

## Performance Considerations

1. **Database Indexes**
   - Foreign key indexes for fast joins
   - Unique constraints for data integrity
   - Composite indexes for common queries

2. **Caching Strategy**
   - Client-side caching of like status
   - Session-based view tracking
   - Real-time stats updates

3. **Scalability**
   - Efficient queries with proper joins
   - Batch operations for stats calculation
   - Optimized database schema

## Error Handling

All API endpoints include comprehensive error handling:

- 400: Bad Request (missing required fields)
- 404: Not Found (blog/user not found)
- 500: Internal Server Error (database/network issues)

Each error response includes a descriptive message for debugging. 