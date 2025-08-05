import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, verificationCode, name) => {
    try {
        const { EMAIL_USER, EMAIL_PASS } = process.env;
        
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log(`Simulated email to ${email} with code: ${verificationCode}`);
            return { messageId: 'simulated-' + Date.now() };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: EMAIL_USER, pass: EMAIL_PASS }
        });

        const result = await transporter.sendMail({
            from: `"SENTRA" <${EMAIL_USER}`,
            to: email,
            subject: 'Email Verification - SENTRA',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Hi ${name},</p>
                    <p>Your verification code:</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #333; font-size: 32px; margin: 0;">${verificationCode}</h1>
                    </div>
                    <p>Code expires in 15 minutes.</p>
                </div>
            `
        });

        console.log(`Email sent to: ${email}`);
        return result;
        
    } catch (error) {
        console.error('Email error:', error.message);
        
        console.log(`Fallback: Code ${verificationCode} for ${email}`);
        return { messageId: 'fallback-' + Date.now() };
    }
};