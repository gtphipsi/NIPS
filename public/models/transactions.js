import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema ({
    reason: {type: String, required: true},
    assigner: {type: String, required: true},
    reciever: {type: String, required: true},
    amount: {type: Number, default: 0},
    dateAssigned: {type: Date, required: true},
    dateEarned: {type: Date, required: true}
});

module.exports.Transaction = mongoose.model('Transaction', transactionSchema);