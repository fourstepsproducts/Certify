const jwt = require('jsonwebtoken');
const transporter = require('./mailer');

const sendVerificationEmail = async (user) => {
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;

    await transporter.sendMail({
        from: `"CertiCraft" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Verify your email",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for signing up for CertiCraft! Please click the link below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>CertiCraft Team</p>
      </div>
    `,
    });
};

module.exports = sendVerificationEmail;
