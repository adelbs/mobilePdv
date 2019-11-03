const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productitemSchema = new Schema({
    codProduct: { type: Number, required: true },
    codProductitem: { type: Number, required: true },
    codSalesorder: Number,
    place: { type: String, required: true, default: 'STORAGE' }, //STORAGE, SHELF, RESERVED, SOLD, CANCELED
    obs: String,
    dtCreate: { type: Date, default: Date.now },
});

module.exports.Productitem = mongoose.model('pdv-cd-productitem', productitemSchema);