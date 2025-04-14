// get the validation results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ msg: "❌ Validation Errors", Errors: errors.array() });
  }

  next();
};

// validating user inputs
export const user_validations = [
  body("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Name is a required field.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should be alphabets only."),

  body("email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Email is a required field.")
    .isEmail()
    .withMessage("Email is not valid.")
    .custom(async (email_value) => {
      const user = await User.findOne({ email: email_value });
      if (user) throw new Error("Email is already in use");
      return true;
    }),

  body("confirm").custom((confirm_value, { req }) => {
    if (confirm_value !== req.body.password)
      throw new Error("Password and Confirm Password are not match.");
    return true;
  }),

  body("password")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password is required field")
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password is not valid"),
  validateRequest, // to extract validation errors from request
];

export const loginValidation = [
  body("email")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Invalid login")
    .isEmail()
    .withMessage("Invalid login"),

  body("password").trim().escape().notEmpty().withMessage("Invalid login"),

  validateRequest, // to extract validation errors from request
];

// This middleware extracts and handles validation errors from the request.

// Functionality:
// It uses validationResult(req) from the express-validator library to check for validation errors in the request.
// If there are errors:
// It sends a 400 Bad Request response with a message ("❌ Validation Errors") and the list of errors.
// If there are no errors:
// It calls next() to pass control to the next middleware or route handler.
// 2. user_validations Middleware
// This is an array of validation rules for user registration.

// Validation Rules:
// Name:

// Must not be empty.
// Must only contain alphabets and spaces.
// If invalid, an error message is returned: "Name is a required field." or "Name should be alphabets only.".
// Email:

// Must not be empty.
// Must be a valid email format.
// Checks if the email already exists in the database using a custom validator (custom).
// If the email is already in use, an error message is returned: "Email is already in use".
// Password Confirmation:

// Ensures that the confirm field matches the password field.
// If they do not match, an error message is returned: "Password and Confirm Password are not match.".
// Password:

// Must not be empty.
// Must meet strong password criteria:
// At least 8 characters.
// At least 1 uppercase letter.
// At least 1 lowercase letter.
// At least 1 number.
// At least 1 symbol.
// If invalid, an error message is returned: "Password is not valid".
// Validation Errors:

// After all the above validations, validateRequest is called to handle any validation errors.
// 3. loginValidation Middleware
// This is an array of validation rules for user login.

// Validation Rules:
// Email:

// Must not be empty.
// Must be a valid email format.
// If invalid, an error message is returned: "Invalid login".
// Password:

// Must not be empty.
// If invalid, an error message is returned: "Invalid login".
// Validation Errors:

// After the above validations, validateRequest is called to handle any validation errors.
// Key Points
// Purpose:

// user_validations: Ensures that user registration data (name, email, password, etc.) is valid and meets specific criteria.
// loginValidation: Ensures that login credentials (email and password) are valid.
// validateRequest: Handles validation errors and prevents invalid data from proceeding further.
// Security:

// Prevents invalid or malicious input from being processed.
// Ensures strong password requirements for user accounts.
// Error Handling:

// Provides clear error messages for invalid input, making it easier for users to correct their mistakes.
// Use Case
// user_validations: Used during user registration to validate the input fields (e.g., name, email, password).
// loginValidation: Used during user login to validate the email and password fields.
// validateRequest: Used to handle validation errors for both registration and login processes.
