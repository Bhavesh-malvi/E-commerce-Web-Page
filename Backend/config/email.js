import nodemailer from "nodemailer";

const sendMail = async ({ email, subject, message }) => {

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      },
      family: 4 // Force IPv4
    });



    const info = await transporter.sendMail({
      from: `"E-Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message
    });


    console.log("✅ MAIL SENT:", info.response);

  } catch (error) {

    console.log("❌ MAIL ERROR:", error);
  }
};

export default sendMail;
