// User Authentication Middleware

export const auth = (req, res, next) => {
  try {
    //const jwt_token = req.headers.authorization.split(" ")[1];
    //extract token from the cookie
    console.log(req.cookies);
    const { jwt_token } = req.cookies;

    const encoded = jwt.verify(jwt_token, "<JWT_KEY>"); // replace <JWT_KEY> with your secret key

    const user = encoded._doc;
    user.password = undefined;
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const isallowed = (roles) => {
  return (req, res, next) => {
    try {
      console.log("isallowed");
      // compare the role of user with the parameter roles
      if (!roles.includes(req.user.role))
        throw createError("This role is not allowed", 403);
      next();
    } catch (error) {
      next(error);
    }
  };
};

// This middleware is responsible for authenticating users by verifying their JSON Web Token (JWT).

// Functionality:
// Extracting the Token:

// It retrieves the jwt_token from the cookies (req.cookies).
// Verifying the Token:

// It verifies the token using jwt.verify(jwt_token, "thisismysecretkey").
// If the token is invalid or expired, an error is thrown.
// Extracting User Data:

// The decoded token contains user data (likely stored in _doc).
// The user's password is removed (user.password = undefined) for security purposes.
// The user data is attached to the req object (req.user) for use in subsequent middleware or route handlers.
// Calling next():

// If the token is valid, the middleware calls next() to pass control to the next middleware or route handler.
// Error Handling:

// If any error occurs (e.g., missing or invalid token), it is passed to the next middleware for centralized error handling.
// 2. isallowed Middleware
// This middleware is responsible for authorizing users based on their roles.

// Functionality:
// Accepting Roles:

// The middleware takes an array of allowed roles as a parameter (roles).
// Checking User Role:

// It compares the user's role (req.user.role) with the allowed roles.
// If the user's role is not included in the allowed roles, it throws an error with the message "This role is not allowed" and a 403 status code.
// Calling next():

// If the user's role is allowed, the middleware calls next() to pass control to the next middleware or route handler.
// Error Handling:

// If any error occurs (e.g., unauthorized role), it is passed to the next middleware for centralized error handling.
// Key Points
// auth Middleware:

// Ensures that only authenticated users with a valid JWT can access protected routes.
// Attaches the authenticated user's data to the req object for further use.
// isallowed Middleware:

// Ensures that only users with specific roles can access certain routes.
// Provides fine-grained access control based on user roles.

// Use Case
// auth: Used to protect routes that require authentication. For example, accessing a user's profile or performing actions that require login.
// isallowed: Used to restrict access to specific roles. For example, allowing only admins to access admin-related routes.
// These two middlewares are typically used together to secure routes in a backend application.
