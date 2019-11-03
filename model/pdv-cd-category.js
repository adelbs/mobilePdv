const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    codCategory: { type: Number, required: true },
    name: { type: String, required: true },
    dtCreate: { type: Date, default: Date.now },
    inactive: Date
});

module.exports.Category = mongoose.model('pdv-cd-category', categorySchema);
module.exports.categorySchema = categorySchema;