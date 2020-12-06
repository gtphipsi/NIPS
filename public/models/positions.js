import mongoose from 'mongoose';
import ObjectId from 'mongoose';
const { Schema } = mongoose;

const positionSchema = new Schema ({
    userId: {type: ObjectId, required: true},
    title: {type: String, required: true},
    privileges: {type: Object, required: true} 
});

module.exports.Position = mongoose.model('Position', positionSchema);