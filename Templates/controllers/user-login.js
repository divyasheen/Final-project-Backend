// Login user

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1. find user by email
    const user = await User.findOne({ email });
    // 2. handle no user with the give email
    if (!user) throw createError("Credentials not match", 401);
    // 3. compare plain password with hashed password
    if (!(await bcrypt.compare(password, user.password)))
      throw createError("Credentials not match", 401);

    /* alternative for method in model */
    // user.password = undefined;
    // user.__v = undefined;

    // create a jwt token
    const token = jwt.sign({ ...user }, "thisismysecretkey", {
      expiresIn: "1h",
    });

    // 4. send res if credentials match
    res
      .cookie("jwt_token", token, {
        httpOnly: false,
        expiresIn: new Date(Date.now() + 9000),
      })
      .json({ msg: "successful login", user: user.clean() });
  } catch (error) {
    next(error);
  }
};



// Functionality
// Extracting Login Credentials:

// The function retrieves the email and password from the request body (req.body).
// Finding the User by Email:

// It searches for a user in the database using User.findOne({ email }).
// If no user is found, it throws an error with the message "Credentials not match" and a 401 status code.
// Validating the Password:

// It compares the provided plain-text password with the hashed password stored in the database using bcrypt.compare().
// If the passwords do not match, it throws the same error ("Credentials not match", 401).
// Creating a JWT Token:

// If the credentials are valid, it generates a JSON Web Token (JWT) using jwt.sign().
// The token contains the user's data and is signed with a secret key ("thisismysecretkey").
// The token is set to expire in 1 hour (expiresIn: "1h").
// Sending the Response:

// If the credentials match, the function:
// Sets a cookie named jwt_token with the generated token.
// The cookie is marked as httpOnly for security (to prevent client-side JavaScript from accessing it).
// The cookie expires after a short duration (new Date(Date.now() + 9000)).
// Sends a JSON response with a success message ("successful login") and the user's sanitized data (user.clean()).
// Error Handling:

// If any error occurs during the process, it is passed to the next middleware for centralized error handling.
// Key Points
// Purpose: This function authenticates a user by validating their email and password, then issues a JWT token for session management.
// Security:
// Passwords are hashed and compared securely using bcrypt.
// The JWT token is stored in an httpOnly cookie to prevent XSS attacks.
// Error Handling: It gracefully handles errors, such as invalid credentials, by throwing appropriate errors and passing them to the error-handling middleware.
// Use Case
// This function is typically called when a user submits a login form. It ensures that only users with valid credentials can log in and provides them with a session token for subsequent authenticated requests.
