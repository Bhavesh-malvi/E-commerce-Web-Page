import { Resend } from "resend"


const resend = new Resend(process.env.RESEND_API_KEY)

const sendMail = async ({email, subject, message}) => {
    try {
        await resend.emails.send({
            from: `E-Shop <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: message,
        });
        console.log("✅ MAIL SENT:", email);
        return true;
    } catch (error) {
        console.log("❌ MAIL ERROR:", error.message);
        return false;
    }
}


export default sendMail;
