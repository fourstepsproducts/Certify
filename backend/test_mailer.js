require('dotenv').config();
const transporter = require('./utils/mailer');

async function testMail() {
    try {
        console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
        console.log('Password length:', process.env.EMAIL_PASS?.length);
        console.log('Password starts with:', process.env.EMAIL_PASS?.substring(0, 3));
        const info = await transporter.sendMail({
            from: `"CertifyPro Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'This is a test email'
        });
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

testMail();
