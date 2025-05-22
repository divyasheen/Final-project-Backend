import nodemailer from "nodemailer";

export const verifyUserByEmail = async (mail_to, mail_subject, mail_htmlMsg) => {
  console.log("📤 Sending to:", mail_to);
  console.log("📨 SMTP user:", process.env.MAIL_USER);

  const transporter = nodemailer.createTransport({
    host: "smtp.mail.de",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

   

  try {
    const result = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: mail_to,
      subject: mail_subject,
      html: mail_htmlMsg ,
    });

    // check if the email accepted
    if (result.accepted.length > 0) {
      return { success: true, msgId: result.messageId };
    } else {
      return { success: false, error: "Email was not accepted by the server" };
    }
  }  catch (error) {
    return { success: false, error: error.message };
  }
};

export const passwordResetTemplate = (name, token) => {
    return `
      <h1>Hi ${name},</h1>
      <p>You requested to reset your password.</p>
      <p>
        <a href="http://localhost:5173/users/reset-password/${token}">
          Click here to reset your password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
    `;
  };


  export const verifyEmailTemplate = (name, token) => {
  return `
       <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9;">
  <h1 style="color: #333;">Welcome, ${name}!</h1>
  <p style="font-size: 18px; color: #555;">Please confirm your email address by clicking the button below:</p>
  <a href="http://localhost:5000/users/verify/${token}" 
     style="display: inline-block; margin-top: 20px; padding: 12px 24px; font-size: 16px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
    Confirm Email
  </a>
</div>

    `;
};
