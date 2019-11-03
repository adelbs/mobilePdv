const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    codCustomer: { type: Number, required: true },
    name: { type: String, required: true },
    dtCreate: { type: Date, default: Date.now },
    inactive: Date,
    phone: String,
    email: String,
    dtBirth: String
});

module.exports.Customer = mongoose.model('pdv-cd-customer', customerSchema);