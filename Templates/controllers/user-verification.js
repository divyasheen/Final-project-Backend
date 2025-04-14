/* ---------------- verify user --------------- */

export const verifyUser = async (req, res, next) => {
  try {
    const { token } = req.params;
    const tokenDoc = await VToken.findOne({ token });
    if (!tokenDoc) throw createError("Invalid verification link!", 404);

    // optional: check if verification link expired

    // if token exist not expired
    // 1. update user
    await User.findByIdAndUpdate(tokenDoc.userId, { verified: Date.now() });
    // 2. delete token
    await VToken.deleteOne({ token });

    res.json({
      msg: "user verified successfully!",
    });
  } catch (error) {
    next(error);
  }
};

//   Functionality
//   Extracting the Token:

//   The function retrieves the token from the request parameters (req.params).
//   Finding the Token in the Database:

//   It searches for the token in the VToken collection using VToken.findOne({ token }).
//   If the token is not found, it throws an error with the message "Invalid verification link!" and a 404 status code.
//   Optional Expiry Check:

//   There is a placeholder comment suggesting that the code could check if the verification link has expired. This is not  implemented in the current code.
//   Verifying the User:

//   If the token exists and is valid:
//   It updates the corresponding user in the User collection by setting the verified field to the current timestamp (Date.now()), marking the user as verified.
//   It uses User.findByIdAndUpdate() to perform this update.
//   Deleting the Token:

//   After verifying the user, it deletes the token from the VToken collection using VToken.deleteOne({ token }). This ensures the token cannot be reused.
//   Sending a Success Response:

//   If everything succeeds, it sends a JSON response with the message "user verified successfully!".
//   Error Handling:

//   If any error occurs during the process, it is passed to the next middleware for centralized error handling.
//   Key Points
//   Purpose: This function verifies a user's email by validating a token sent to them (likely via email) and updating their status in the database.
//   Security: By deleting the token after use, it ensures the verification link cannot be reused.
//   Error Handling: It gracefully handles errors, such as invalid tokens, by throwing an appropriate error and passing it to the error-handling middleware.
//   Use Case
//   This function is typically called when a user clicks on a verification link in their email. It ensures that only users with a valid token can verify their accounts.
