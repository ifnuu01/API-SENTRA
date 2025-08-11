import {body, validationResult} from 'express-validator';


export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
}

export const validateUpdateProfile = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Nama minimal 2 karakter').bail()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Nama hanya boleh huruf dan spasi'),
    
    handleValidationErrors
]

export const validateForgetPassword = [
    body('email')
        .isEmail().normalizeEmail().withMessage('Format email tidak valid').bail(),

    handleValidationErrors
]

export const validateVerifyForgetPassword = [
    body('email')
        .isEmail().normalizeEmail().withMessage('Format email tidak valid').bail(),
    body('verificationCode')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Kode verifikasi harus 6 digit angka'),
    
    handleValidationErrors
]

export const validateNewPassword = [
    body('newPassword')
        .isLength({min: 6}).withMessage('Password minimal 6 karakter').bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
    body('confirmPassword')
        .notEmpty().withMessage('Konfirmasi Password tidak boleh kosong').bail()
        .custom((value, {req}) => {
            if(value !== req.body.newPassword){
                throw new Error('Konfirmasi Password tidak sesuai dengan Password Baru');
            }
            return true;
        }),
    
    handleValidationErrors
]

export const validateUpdatePassword = [
    body('oldPassword')
        .isLength({min: 6}).withMessage('Password minimal 6 karakter').bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
    body('newPassword')
        .isLength({min: 6}).withMessage('Password minimal 6 karakter').bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
    body('confirmPassword')
        .notEmpty().withMessage('Konfirmasi Password tidak boleh kosong').bail()
        .custom((value, {req}) => {
            if(value !== req.body.newPassword){
                throw new Error('Konfirmasi Password tidak sesuai dengan Password Baru');
            }
            return true;
        }),
    
    handleValidationErrors
]

// login
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail().withMessage('Format Email tidak valid').bail(),
    body('password')
        .isLength({min: 6}).withMessage('Password minimal 6 karakter').bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
    
    handleValidationErrors
]

// register
export const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Nama minimal 2 karakter').bail()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Nama hanya boleh huruf dan spasi'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Format email tidak valid'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password minimal 6 karakter').bail()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password harus mengandung huruf besar, kecil, dan angka'),
    body('confirmPassword')
        .notEmpty().withMessage('Konfirmasi Password tidak boleh kosong').bail()
        .custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('Konfirmasi Password tidak sesuai dengan Password Baru');
            }
            return true;
        }),
    
    handleValidationErrors   
]


// verify email
export const validateVerifyEmail = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Format email tidak valid'),
    
    body('verificationCode')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('Kode verifikasi harus 6 digit angka'),
    
    handleValidationErrors
];

// resend code verify
export const validateResendCode = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Format email tidak valid'),
    
    handleValidationErrors
];