const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    codUser: { type: Number, required: true },
    name: { type: String, required: true },
    dtCreate: { type: Date, default: Date.now },
    inactive: Date,
});

module.exports.User = mongoose.model('pdv-cd-user', userSchema);