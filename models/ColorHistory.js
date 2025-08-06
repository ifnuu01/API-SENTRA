import mongoose from "mongoose";

const colorHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hex: String,
    rgb: String,
    hsl: String,
    name: String,
    image: String,
    detectedAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model('ColorHistory', colorHistorySchema);