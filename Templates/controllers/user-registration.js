// Import required modules

export const registerUser = async (req, res, next) => {
  try {
    const userData = {
      ...req.body,
      prifilepic: req.myFileName,
    };
    const newUser = await User.create(userData);
    const newToken = await VToken.create({
      userId: newUser._id,
      token: Date.now() + "_" + newUser._id,
    });

    // send Mail
    const mailresult = await verifyUserByEmail(
      newUser.email,
      "Verify your Email for your FullStack",
      verifyEmailTemplate(newUser.name, newToken.token)
    );

    res.json({
      success: true,
      msg: "User Created Successfully",
      data: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: newToken.token,
        msgId: mailresult.msgId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Extracting User Data:

// The function takes req, res, and next as parameters, which are typical in Express.js middleware.
// It extracts user data from the request body (req.body) and adds a prifilepic property from req.myFileName.
// Creating a New User:

// It uses the User.create() method to create a new user in the database with the extracted data.
// Generating a Verification Token:

// After creating the user, it generates a verification token using VToken.create(). The token is a combination of the current timestamp and the user's ID.
// Sending a Verification Email:

// It sends a verification email to the newly registered user using the verifyUserByEmail function. The email includes a verification link or token, and the email content is generated using the verifyEmailTemplate function.
// Sending a Response:

// If everything succeeds, it sends a JSON response back to the client with:
// A success message.
// The user's ID, name, email, the generated token, and the message ID from the email service.
// Error Handling:

// If any error occurs during the process, it passes the error to the next middleware for centralized error handling.
// Key Points:
// Database Interaction: The code interacts with the database to create a user and a verification token.
// Email Verification: It ensures the user verifies their email by sending a verification email.
// Error Handling: Errors are caught and passed to the next middleware for handling.
