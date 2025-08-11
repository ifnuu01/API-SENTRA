import bcrypt from "bcryptjs";
import User from "../models/User.js";
import crypto from 'crypto';
import { generateToken } from "../utils/generateToken.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import ColorHistory from "../models/ColorHistory.js";
import cloudinary from "../config/cloudinary.js";

/*
    [X] - Regitser
    [X]  - Login
    [X] - Verify email
    [X] - Resend verification code
*/ 

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ message: "Email sudah terdaftar" });
            }

            existingUser.verificationCode = verificationCode;
            existingUser.verificationExpires = verificationExpires;
            existingUser.name = name;
            existingUser.password = await bcrypt.hash(password, 12);

            await existingUser.save();
            await sendVerificationEmail(email, verificationCode, name);

            res.status(201).json({
                message: "Email sudah terdaftar silahkan verfikasi",
                user: {
                    email: existingUser.email,
                }
            })
            return
        }

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
            message: "Email sudah terdaftar silahkan verifikasi",
            user: {
                email: user.email,
            }
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

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");

        if (!user){
            return res.status(400).json({message: 'Data profile tidak ada'})
        }
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const user = await User.findById(userId);
        if (!user){
            return res.status(400).json({message: 'Data pengguna tidak ditemukan'})
        }

        user.name = name;
        await user.save();

        res.json({
            message: 'Nama berhasil diperbarui'
        });

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword} = req.body;
        const user = await User.findById(userId);

        if (!user){
            return res.status(400).json({message: 'Data pengguna tidak ditemukan'});
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password);

        if(!isValidPassword) {
            return res.status(400).json({message: 'Password lama tidak sesuai'});
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        res.json({
            message: 'Password berhasil diperbarui'
        })

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}


export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Data pengguna tidak ditemukan'
            });
        }
        const colorHistories = await ColorHistory.find({ user: userId });
        
        for (const history of colorHistories) {
            if (history.image) {
                try {
                    const publicId = history.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`sentra_images/${publicId}`);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                }
            }
        }
        await ColorHistory.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);
        
        res.json({
            message: 'Akun berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({email, isVerified: true});

        if(!user) {
            res.status(400).json({
                message: 'Email tidak terdaftar'
            });
            return;
        }

        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        
        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        
        await user.save();

        await sendVerificationEmail(email, verificationCode, user.name);

        res.json({
            message: 'Kode verifikasi berhasil dikirim',
        });

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const verifyForgetPassword = async (req, res) => {
    try {
        const { email, verificationCode} = req.body;

        const user = await User.findOne({
            email, isVerified: true
        });

        if(!user) {
            res.status(400).json({
                message: 'Email tidak terdaftar'
            });
            return;
        }

        if(user.verificationCode !== verificationCode) {
            res.status(400).json({
                message: 'Kode verifikasi anda salah'
            });
            return;
        }

        user.verificationCode = undefined;    
        user.verificationExpires = undefined;
        await user.save();

        const token = generateToken(user._id, '15m');

        res.json({
            message: 'Kode verifikasi benar silahkan ganti password baru',
            token
        });

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const newPassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPassword } = req.body;

        const user = await User.findById(userId);

        if(!user) {
            res.status(400).json({
                message: 'Email tidak terdaftar'
            });
            return;
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        user.password = hashed;
        await user.save();

        res.json({
            message: 'Ubah password berhasil'
        });

    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
}