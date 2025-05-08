import bcrypt from 'bcryptjs';

export async function hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(plainPassword, salt)
}

export async function comparePassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword)
}