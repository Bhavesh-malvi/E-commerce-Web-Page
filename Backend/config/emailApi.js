import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmailApi = async ({ email, subject, message, html }) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html || `<html><body><p>${message}</p></body></html>`;
        sendSmtpEmail.sender = { name: "E-Shop", email: process.env.EMAIL_USER}; // Use verified sender
        sendSmtpEmail.to = [{ email: email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('API called successfully. Returned data: ', data);
        return { success: true, data };
    } catch (error) {
        console.error('Brevo API Error:', {
            status: error.status,
            message: error.message,
            body: error.response?.body || error.response?.text
        });
        return { success: false, error };
    }
};
