

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (name_value) {
        return v.matches(name_value, /^[A-Za-z\s]+$/);
      },
      message: "Name is not valid",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (email_value) {
        return v.isEmail(email_value);
      },
      message: "Email is not valid",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (password_value) {
        // length >= 8 atLeast 1UpperCase   1LowerCase  1Digit 1Symbol
        return v.isStrongPassword(password_value, {
          minLength: 8,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        });
      },
      message:
        "Valid password should contains 8char length, atLeast 1UpperCase   1LowerCase  1Digit 1Symbol",
    },
  },
  verified: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin", "editor", "guest"],
    default: "guest",
  },
});

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

// middleware
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

// method to clear user from un-necessary data
userSchema.methods.clean = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;

  return user;
};

const User = model("User", userSchema);
export const VToken = model("VToken", tokenSchema);
export default User;

// This file defines two Mongoose schemas, userSchema and tokenSchema, for managing users and their associated tokens in a MongoDB database. It also includes middleware and methods for additional functionality. Here's a detailed breakdown:

// 1. userSchema
// This schema defines the structure and validation rules for user documents in the database.

// Fields:
// name:

// Type: String
// Required: Yes
// Validation:
// Must match the regex /^[A-Za-z\s]+$/ (only alphabets and spaces).
// If invalid, the error message is "Name is not valid".
// email:

// Type: String
// Required: Yes
// Unique: Yes (ensures no duplicate emails in the database).
// Validation:
// Must be a valid email format (v.isEmail).
// If invalid, the error message is "Email is not valid".
// password:

// Type: String
// Required: Yes
// Validation:
// Must meet strong password criteria:
// At least 8 characters.
// At least 1 uppercase letter.
// At least 1 lowercase letter.
// At least 1 number.
// At least 1 symbol.
// If invalid, the error message is: "Valid password should contains 8char length, atLeast 1UpperCase   1LowerCase  1Digit 1Symbol".
// verified:

// Type: Date
// Default: null (indicates whether the user has been verified).
// role:

// Type: String
// Enum: Allowed values are 'user', 'admin', 'editor', 'guest'.
// Default: 'guest'.
// 2. tokenSchema
// This schema defines the structure for storing tokens associated with users (e.g., for email verification or password reset).

// Fields:
// userId:

// Type: Schema.Types.ObjectId (references the user's ID).
// Required: Yes.
// token:

// Type: String
// Required: Yes.
// created:

// Type: Date
// Default: Date.now() (timestamp when the token is created).
// 3. Middleware
// userSchema.pre('save'):
// This middleware runs before saving a user document to the database.
// Purpose:
// Hashes the user's password using bcrypt if the password field has been modified.
// Steps:
// Checks if the password field is modified (this.isModified('password')).
// If modified:
// Generates a salt using bcrypt.genSalt(10).
// Hashes the password using bcrypt.hash() and replaces the plain-text password with the hashed version.
// If not modified, it skips the hashing process.
// 4. Methods
// userSchema.methods.clean:
// Purpose:
// Removes sensitive or unnecessary fields from the user object before sending it to the client.
// Steps:
// Converts the Mongoose document to a plain JavaScript object (this.toObject()).
// Deletes the password and __v fields.
// Returns the cleaned user object.
// 5. Models
// User:
// Created from userSchema.
// Represents the users collection in the database.
// VToken:
// Created from tokenSchema.
// Represents the tokens collection in the database.
// Key Points
// Purpose:
// userSchema: Manages user data, including validation, password hashing, and role-based access.
// tokenSchema: Manages tokens for user-related actions like email verification or password reset.
// Security:
// Passwords are hashed before being stored in the database.
// Sensitive fields like password are removed before sending user data to the client.
// Validation:
// Ensures that user inputs (e.g., name, email, password) meet specific criteria.
// Extensibility:
// The role field allows for role-based access control.
// The verified field tracks whether a user has completed email verification.
// Use Case
// userSchema:
// Used for creating, validating, and managing user accounts.
// Ensures secure storage of user passwords and provides role-based access control.
// tokenSchema:
// Used for managing tokens for actions like email verification or password reset.
