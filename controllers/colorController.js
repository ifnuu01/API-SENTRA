import getColors from 'get-image-colors';
import namer from 'color-namer';
import ColorHistory from '../models/ColorHistory.js';
import cloudinary from '../config/cloudinary.js';

export const detectColor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang terkirim' });
    }

    const imageUrl = req.file.path; 

    const colors = await getColors(imageUrl, { type: req.file.mimetype });

    if (!colors || colors.length === 0) {
      return res.status(400).json({ message: 'Tidak dapat mendeteksi warna dari gambar' });
    }

    const dominant = colors[0];
    const hex = dominant.hex();
    const rgb = dominant.css();
    const hsl = dominant.hsl();
    const name = namer(hex).ntc[0].name;
    const hslString = `hsl(${Math.round(hsl[0])}, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%)`;

    await ColorHistory.create({
      user: req.user.id,
      hex,
      rgb,
      hsl: hslString,
      name,
      image: imageUrl 
    });

    res.json({
      message: 'Warna berhasil dideteksi',
      color: { hex, hsl: hslString, rgb, name }
    });

  } catch (error) {
    console.error('Error detecting color:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDetectColor = async (req, res) => {
    try {
        const colorHistory = await ColorHistory.find({
            user: req.user.id
        }).sort({detectedAt: -1});

        res.json({data: colorHistory});
    } catch (error) {
        console.error('Error detecting color:', error);
        res.status(500).json({message: error.message});
    }
}

export const getDetectColorById = async (req, res) => {
    try {
        const id = req.params.id;
        const colorHistory = await ColorHistory.findById(id);

        if (!colorHistory) {
            return res.status(404).json({message: 'Riwayat warna tidak ditemukan'});
        }
        res.json({data: colorHistory});

    } catch (error) {
        console.error('Error detecting color:', error);
        res.status(500).json({message: error.message});
    }
}

export const deleteDetectColor = async (req, res) => {
    try {
        const id = req.params.id;
        const colorHistory = await ColorHistory.findById(id);

        if (!colorHistory) {
        return res.status(404).json({ message: 'Riwayat warna tidak ditemukan' });
        }

        // Hapus dari Cloudinary
        const publicId = colorHistory.image.split('/').pop().split('.')[0]; 
        await cloudinary.uploader.destroy(`sentra_images/${publicId}`);

        await ColorHistory.findByIdAndDelete(id);

        res.json({ message: 'Riwayat warna berhasil dihapus' });
    } catch (error) {
        console.error('Error detecting color:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteAllDetectColor = async (req, res) => {
    try {
        const userId = req.user.id;

        const colorHistories = await ColorHistory.find({ user: userId });

        if (colorHistories.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada riwayat warna yang ditemukan'
            });
        }

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

        const result = await ColorHistory.deleteMany({ user: userId });

        res.json({
            message: 'Semua riwayat warna berhasil dihapus',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error detecting color:', error);
        res.status(500).json({message: error.message});
    }
}