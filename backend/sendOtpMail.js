const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "blogsyte@gmail.com",
    pass: "exof tvem ylag ofiu", // use the 16-character app password here
  },
});

const sendOTP = async (toEmail, otpCode) => {
    await transporter.sendMail({
        from: '"Blogsyte Team" <blogsyte.hub@gmail.com>',
        to: toEmail,
        subject: "Verify Your Email - Blogsyte OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4a90e2;">Blogsyte Email Verification</h2>
            <p>Dear User,</p>
            <p>Thank you for signing up on <strong>Blogsyte</strong>.</p>
            <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
            <p style="font-size: 20px; font-weight: bold; color: #4a90e2;">${otpCode}</p>
            <p>This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>Blogsyte Team</strong></p>
          </div>
        `,
      });
      
};

module.exports = { sendOTP };
