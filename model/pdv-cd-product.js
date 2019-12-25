const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    codProduct: { type: Number, required: true },
    codCategory: { type: Number, required: true },
    name: { type: String, required: true },
    desc: String,
    inactive: Date,
    dtCreate: { type: Date, default: Date.now },
    cost: { type: Number, required: true, default: 0 },
    value: { type: Number, required: true, default: 0 }
});

module.exports.Product = mongoose.model('pdv-cd-product', productSchema);