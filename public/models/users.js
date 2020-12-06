import { Int32 } from 'mongodb';
import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema ({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    badgeNumber: {type: Number, required: true},
    admin: {type: Boolean, default: false},
    officerPositions: {type: Object, required: true}
});

module.exports.User = mongoose.model('User', userSchema);