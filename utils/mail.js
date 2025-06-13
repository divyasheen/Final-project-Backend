import nodemailer from "nodemailer";
import dotenv from "dotenv";

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

export const sendInviteMail = async (req, res) => {
  dotenv.config();
const { email } = req.body;

if (!email) return res.status(400).send("Send Invite: Email is missing!");

// JB: create transporter - this is like a postman who deliver the mail
const transporter = nodemailer.createTransport({
  host: "smtp.mail.de",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

    // JB: Write the mail
    const invitation = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "A friend needs your help to rescue Coderealm",
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f9f9f9;">
        <h1 style="color: #333;">You are invited!</h1>
        <p style="font-size: 18px; color: #555;">
        A friend would like to invite you to join him on an adventure on Coderealm and learn how to create your own websites using HTML, CSS and JavaScript.<br><br>
        
        If you would like to find out more, please visit us:<a href="www.google.com">Coderealm</a> <br><br>
        
        If you would like to register, click here:<a href="http://localhost:5173/register" > Register Now</a>
        <br><br>
        We would be delighted to welcome you to Coderealms soon.
        <br>
        With best regards, </p>
        
        <h2>the Coderealms Team</h2>
        </div>
        `,}
      
      //JB : give the invitation to the postman
try {
  await transporter.sendMail(invitation);
  // console.log("BE - InvitationMail is send to: ", email);
  res.status(200).send("InvitationMail is send")
} catch(error) {
  console.error("BE - Sending invitation: ", error)
  res.status(500).send("Error sending InvitationMail")
}
} 
