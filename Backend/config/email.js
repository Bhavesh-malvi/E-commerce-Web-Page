import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
});

const sendMail = async ({ email, subject, message }) => {
  try {
    await transporter.sendMail({
      from: `E-Shop <${process.env.EMAIL_USER || process.env.BREVO_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log("✅ MAIL SENT");
    return true;

  } catch (error) {
    console.log("❌ MAIL ERROR:", error);
    return false;
  }
};

export default sendMail;
