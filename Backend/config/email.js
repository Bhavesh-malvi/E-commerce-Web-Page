import nodemailer from "nodemailer";

const sendMail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,        
      secure: false,     
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        rejectUnauthorized: false, 
      },
    });

    await transporter.verify();
    console.log("✅ SMTP Connected Successfully");

    const info = await transporter.sendMail({
      from: `"E-Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log("✅ MAIL SENT:", info.messageId);
    return true;

  } catch (error) {
    console.log("❌ MAIL ERROR:", error.message);
    return false;
  }
};

export default sendMail;
