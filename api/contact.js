const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { user_name, user_email, subject, message } = req.body;

    // Basic validation
    if (!user_name || !user_email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in all required fields (name, email, message).',
        });
    }

    // Create transporter using Vercel environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${user_name}" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_USER,
        replyTo: user_email,
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
};
