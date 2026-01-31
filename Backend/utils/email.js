import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g., yourgmail@gmail.com
    pass: process.env.EMAIL_PASS  // e.g., generated app password
  }
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
        from: `"TrendHive Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
