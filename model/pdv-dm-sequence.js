const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sequenceSchema = new Schema({
    name: { type: String, required: true },
    current: { type: Number, required: true }
});

module.exports.Sequence = mongoose.model('pdv-dm-sequence', sequenceSchema);