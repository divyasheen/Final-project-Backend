import nodemailer from "nodemailer";

/**
 *
 * @param {String} mail_to receiver of the email
 * @param {String} mail_subject Subject of the email
 * @param {String} mail_htmlMsg Body of the email
 * @returns Object {success: Boolean, messageId: String}
 */

export const verifyUserByEmail = async (
  mail_to,
  mail_subject,
  mail_htmlMsg
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.de",
    port: "465",
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
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyEmailTemplate = (name, token) => {
  return `
        <h1>Welcome ${name}!</h1>
        <p>
            <a href="https://localhost:3000/users/verify/${token}">
                Click here to verify your account
            </a>
        </p>    
    `;
};



// This file defines two utilities for handling email functionality in a backend system: verifyUserByEmail for sending emails and verifyEmailTemplate for generating email content. Here's a detailed explanation:

// 1. verifyUserByEmail Function
// This function sends an email to a specified recipient using the nodemailer library.

// Parameters:
// mail_to: The recipient's email address.
// mail_subject: The subject of the email.
// mail_htmlMsg: The HTML content of the email.
// Functionality:
// Create a Transporter:

// A nodemailer transporter is created using the nodemailer.createTransport() method.
// The transporter uses SMTP settings:
// host: The SMTP server (smtp.mail.de).
// port: The port (465).
// auth: Authentication credentials (MAIL_USER and MAIL_PASS) are retrieved from environment variables.
// Send the Email:

// The transporter.sendMail() method is used to send the email.
// The email includes:
// from: The sender's email address (from MAIL_USER).
// to: The recipient's email address (mail_to).
// subject: The subject of the email (mail_subject).
// html: The HTML content of the email (mail_htmlMsg).
// Check the Result:

// If the email is successfully accepted by the server (result.accepted.length > 0), the function returns an object with:
// success: true
// msgId: The message ID of the sent email.
// If the email is not accepted, it returns:
// success: false
// error: A message indicating the email was not accepted.
// Error Handling:

// If an error occurs during the email-sending process, the function catches the error and returns:
// success: false
// error: The error message.
// 2. verifyEmailTemplate Function
// This function generates the HTML content for a verification email.

// Parameters:
// name: The recipient's name.
// token: A unique token for verifying the user's account.
// Functionality:
// Generate HTML Content:
// The function returns a string containing HTML content.
// The email includes:
// A welcome message with the recipient's name.
// A link to verify the user's account. The link includes the verification token (https://localhost:3000/users/verify/${token}).
// Key Points
// Purpose:

// verifyUserByEmail: Sends an email to a user, typically for account verification or other notifications.
// verifyEmailTemplate: Generates the HTML content for a verification email, including a link with a unique token.
// Security:

// Authentication credentials (MAIL_USER and MAIL_PASS) are stored in environment variables to avoid hardcoding sensitive information.
// The verification link includes a token, which is likely validated on the server to ensure secure account verification.
// Error Handling:

// The verifyUserByEmail function gracefully handles errors, returning a clear error message if the email fails to send.
// Use Case
// verifyUserByEmail:
// Used to send emails for account verification, password resets, or other notifications.
// verifyEmailTemplate:
// Used to generate the content of a verification email, which is passed to verifyUserByEmail.
// For example, when a user registers, the backend can use verifyEmailTemplate to create the email content and verifyUserByEmail to send the email with the verification link.