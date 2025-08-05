import bcrypt from "bcryptjs";
import User from "../models/User.js";
import crypto from 'crypto';
import { generateToken } from "../utils/generateToken.js";
import { sendVerificationEmail } from "../utils/emailService.js";


/*
    [X] - Regitser
    [X]  - Login
    [X] - Verify email
    [X] - Resend verification code
*/ 

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationCode,
            verificationExpires
        });

        await user.save();

        await sendVerificationEmail(email, verificationCode, name);

        res.status(201).json({
            message: "User berhasil dibuat",
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email, isVerified:true});

        if(!user) {
            return res.status(400).json({message: "Email tidak terdaftar" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if(!isValidPassword) {
            return res.status(400).json({message: "Password salah" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login berhasil",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}


export const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const user = await User.findOne({
            email,
            verificationCode,
            verificationExpires: { $gt: new Date() }
        });

        if(!user) {
            return res.status(400).json({ message: "Gagal memverifikasi kode" });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationExpires = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Berhasil memverifikasi email",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email, isVerified: false
        });

        if(!user) {
            return res.status(400).json({ message: "User tidak ada atau sudah terverifikasi" });
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        
        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        await user.save();

        await sendVerificationEmail(email, verificationCode, user.name);

        res.status(200).json({message: 'Kode verifikasi berhasil dikirim'});
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}