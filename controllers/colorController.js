import getColors from 'get-image-colors';
import namer from 'color-namer';
import path from 'path';
import fs from 'fs';
import ColorHistory from '../models/ColorHistory.js';

export const detectColor = async (req, res) => {
    try {
        if(!req.file) {
            return res.status(400).json({message: 'Tidak ada file yang terkirim'});
        }

        const imagePath = path.join(process.cwd(), req.file.path);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({message: 'File tidak ditemukan'});
        }

        const colors = await getColors(imagePath);

        if (!colors || colors.length === 0) {
            return res.status(400).json({message: 'Tidak dapat mendeteksi warna dari gambar'});
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
            image: req.file.path
        });

        res.json({
            message: 'Warna berhasil dideteksi',
            color: {
                hex, hsl: hslString, rgb, name
            }
        });

    } catch (error) {
        console.error('Error detecting color:', error);
        res.status(500).json({message: error.message});
    }   
}

export const getDetectColor = async (req, res) => {
    try {
        const colorHistory = await ColorHistory.find({
            user: req.user.id
        })

        const colorHistoryImage = colorHistory.map(history => {
            const historyObj = history.toObject();
            if(historyObj.image){
                historyObj.image = `${req.protocol}://${req.get('host')}\/${historyObj.image}`
            }
            return historyObj;
        })
        res.json({data: colorHistoryImage});
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

        const historyObj = colorHistory.toObject();
        if(historyObj.image){
            historyObj.image = `${req.protocol}://${req.get('host')}\/${historyObj.image}`
        }

        res.json({data: historyObj});

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
            return res.status(404).json({message: 'Riwayat warna tidak ditemukan'});
        }

        if(colorHistory.image) {
            const oldImagePath = path.join(process.cwd(), colorHistory.image);
            if(fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        await ColorHistory.findByIdAndDelete(id);

        res.json({
            message: 'Riwayat warna berhasil dihapus',
        })
    } catch (error) {
        console.error('Error detecting color:', error);
        res.status(500).json({message: error.message});   
    }
}