const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — allow requests from Live Server (127.0.0.1 / localhost)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve all static files (HTML, CSS, JS, images) from the frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── Nodemailer Transporter (Gmail SMTP) ─────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,           // smtp.gmail.com
    port: Number(process.env.MAIL_PORT),   // 587
    secure: false,                         // true for 465, false for 587
    auth: {
        user: process.env.MAIL_USER,       // your Gmail address
        pass: process.env.MAIL_PASS,       // your Gmail App Password
    },
});

// Verify connection on startup
transporter.verify((err, success) => {
    if (err) {
        console.error('❌ Mail transporter error:', err.message);
    } else {
        console.log('✅ Mail server is ready to send emails');
    }
});

// ─── Contact Form API ────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { user_name, user_email, subject, message } = req.body;

    // Basic validation
    if (!user_name || !user_email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields (name, email, message).',
        });
    }

    // Mail options — email sent TO you, with reply-to set to the visitor
    const mailOptions = {
        from: `"${user_name}" <${process.env.MAIL_USER}>`,   // sender (your Gmail)
        to: process.env.MAIL_USER,                            // receiver (your Gmail)
        replyTo: user_email,                                  // visitor's email for easy reply
        subject: subject || `Portfolio Contact: ${user_name}`,
        html: `
            <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:12px; overflow:hidden;">
                <div style="background:linear-gradient(135deg,#667eea,#764ba2); padding:30px; text-align:center;">
                    <h1 style="color:#fff; margin:0; font-size:24px;">📬 New Contact Message</h1>
                </div>
                <div style="padding:30px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:12px 8px; font-weight:bold; color:#555; width:100px;">Name</td>
                            <td style="padding:12px 8px; color:#222;">${user_name}</td>
                        </tr>
                        <tr style="background:#f9f9f9;">
                            <td style="padding:12px 8px; font-weight:bold; color:#555;">Email</td>
                            <td style="padding:12px 8px; color:#222;"><a href="mailto:${user_email}" style="color:#667eea;">${user_email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding:12px 8px; font-weight:bold; color:#555;">Subject</td>
                            <td style="padding:12px 8px; color:#222;">${subject || 'No subject'}</td>
                        </tr>
                    </table>
                    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                    <h3 style="color:#333; margin-bottom:8px;">Message</h3>
                    <p style="color:#444; line-height:1.7; white-space:pre-wrap;">${message}</p>
                </div>
                <div style="background:#f5f5f5; padding:15px; text-align:center; font-size:12px; color:#999;">
                    Sent from your Portfolio Contact Form
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent from ${user_name} (${user_email})`);
        return res.status(200).json({
            success: true,
            message: 'Message sent successfully!',
        });
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
        });
    }
});

// ─── Fallback: serve index.html for any other route ──────────
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});