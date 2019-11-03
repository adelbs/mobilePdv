const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salesorderSchema = new Schema({
    codOrder: { type: Number, required: true },
    codCustomer: Number,
    codUser: Number,
    status: { type: String, required: true, default: 'OPEN' }, //OPEN, CLOSED, RETURNED
    totalValue: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    productItemList: [
        {
            codProduct: { type: Number, required: true },
            name: { type: String, required: true },
            value: { type: Number, required: true },
            codProductitem: [ Number ]
        }
    ],
    paymentList: [
        {
            paymentType: { type: String, required: true }, //CASH, CREDIT, DEBIT, CHECK
            value: { type: Number, required: true }
        }
    ],
    obs: String,
    dtCreate: { type: Date, default: Date.now },
});

module.exports.Salesorder = mongoose.model('pdv-ng-saleorder', salesorderSchema);