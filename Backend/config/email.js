import nodemailer from "nodemailer";

const sendMail = async ({ email, subject, message }) => {

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000, // 10 Seconds
      greetingTimeout: 5000,
      socketTimeout: 10000,
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
