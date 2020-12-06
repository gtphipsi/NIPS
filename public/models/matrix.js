import mongoose from 'mongoose';
import ObjectId from 'mongoose';
const { Schema } = mongoose;

const itemSchema = new Schema ({
    positivePoints: {type: Number, required: true},
    negativePoints: {type: Number, required: true},
    assigner: {type: ObjectId, required: true},
    reason: {type: String, required: true}
});

module.exports.Matrix = mongoose.model('Matrix', itemSchema);