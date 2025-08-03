# BlogSyte Backend Server

This is the backend server for BlogSyte's OTP functionality.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Email Settings
Update the email configuration in `sendOtpMail.js`:
- Replace `blogsyte@gmail.com` with your Gmail address
- Replace the app password with your Gmail app password

### 3. Start the Server
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### POST /api/send-otp
Sends a 6-digit OTP to the specified email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "email": "user@example.com"
}
```

### POST /api/verify-otp
Verifies the OTP entered by the user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

## Features

- ✅ 6-digit OTP generation
- ✅ Email delivery via Gmail SMTP
- ✅ 5-minute OTP expiration
- ✅ Maximum 3 failed attempts
- ✅ Automatic cleanup of expired OTPs
- ✅ CORS enabled for frontend integration

## Security Notes

- OTPs are stored in memory (use Redis/database for production)
- Email credentials should be stored in environment variables
- Consider rate limiting for production use 