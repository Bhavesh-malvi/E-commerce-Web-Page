import nodemailer from "nodemailer";

const sendMail = async ({ email, subject, message }) => {

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
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
