import jwt from 'jsonwebtoken';

export const generateToken = (userId, time=undefined) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: time
    });
};