import { body, validationResult } from "express-validator"



const validatePassword = (password) => {
    
    const minLength = 8
    const minUppercase = 1
    const minLowercase = 1
    const minNumbers = 1
    const minSymbols = 1 
    
    let errors = []

    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`) 
    if (!/[A-Z]/.test(password)) errors.push(`Password must contain at least ${minUppercase} uppercase letter(s)`)
    if (!/[a-z]/.test(password)) errors.push(`Password must contain at least ${minLowercase} lowercase letter(s)`)
    if (!/[0-9]/.test(password)) errors.push(`Password must contain at least ${minNumbers} number(s)`)
    if (!/[^A-Za-z0-9]/.test(password)) errors.push(`Password must contain at least ${minSymbols} special character(s)`)
    
    return errors;
}

export const validateUser = [

    body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long")
        .isAlphanumeric()
        .withMessage("Username must contain only letters and numbers"),

    body("email").isEmail().withMessage("Invalid email format"),

    body("password").custom(value => {
        const passwordErrors = validatePassword(value)
        if (passwordErrors.length > 0) {
            throw new Error(passwordErrors.join(", "))
        }
        return true
    }),
    
    body("role").optional().isIn(["student", "admin"]).withMessage('Role must be either "student" or "admin"'),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
]


