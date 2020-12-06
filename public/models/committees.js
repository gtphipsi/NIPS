import mongoose from 'mongoose';
const { Schema } = mongoose;

const committeeSchema = new Schema ({
    members: {type: Array, required: true},
    committee: {type: String, required: true},
    head: {type: String, required: true},
    budget: {type: Number, required: true}
});

module.exports.Committee = mongoose.model('Committee', committeeSchema);