import jwt from 'jsonwebtoken';

export const generateToken = (userId, time=undefined) => {
    const payload = { id: userId };
    const options = time ? { expiresIn: time } : {};
    return jwt.sign(payload, process.env.JWT_SECRET, options);
};