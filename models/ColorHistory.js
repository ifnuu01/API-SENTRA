import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  hex: String,
  rgb: String,
  hsl: String,
  name: String,
}, { _id: false });

const colorHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
colors: [colorSchema], 
  image: String,
  detectedAt: {
    type: Date,
    default: Date.now
  },
});

export default mongoose.model('ColorHistory', colorHistorySchema);