import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = './uploads/images';
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(new Error('Jenis file tidak didukung. Hanya JPEG, JPG, PNG, dan GIF yang diizinkan.'), false);
    }
};


export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024} // 2 MB
})