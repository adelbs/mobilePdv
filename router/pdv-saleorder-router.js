const log = require('../helper/logger');
const { Salesorder } = require('../model/pdv-ng-saleorder');
const { Product } = require('../model/pdv-cd-product');
const { Productitem } = require('../model/pdv-cd-productitem');
const { Customer } = require('../model/pdv-cd-customer');
const { next } = require('../helper/sequence');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const orders = await Salesorder.find().select('-__v');
        res.send(orders);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/filter', async (req, res) => {
    try {
        const orders = await Salesorder.find(req.body).select('-__v');
        let customerList;
        let order;
        let result = [];

        for (let i = 0; i < orders.length; i++) {
            order = orders[i].toObject();
            customerList = await Customer.find({ codCustomer: orders[i].codCustomer });
            if (customerList.length > 0) order.customer = customerList[0];
            else order.customer = {};

            result.push(order);
        }

        res.send(result);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const order = await Salesorder.findOne({ _id: req.params.id }).select('-__v');
        let orderObj = order.toJSON();
        let product;
        let customerList = [];

        if (orderObj.codCustomer) customerList = await Customer.find({ codCustomer: orderObj.codCustomer });
        
        if (customerList.length > 0) orderObj.customer = customerList[0];
        else orderObj.customer = { };

        for (let i = 0; i < orderObj.productItemList.length; i++) {
            product = await Product.findOne({ codProduct: orderObj.productItemList[i].codProduct }).select('_id');
            if (product) orderObj.productItemList[i]._idProduct = product._id;
        }

        res.send(orderObj);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Salesorder.deleteOne({ _id: req.params.id }).select('-__v');
        res.send({ message: 'Deleted' });
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/', async (req, res) => {
    try {
        let order = new Salesorder(req.body);
        let objOrder;

        order.codOrder = await next(Salesorder);
        order = await order.save();

        objOrder = order.toJSON();
        objOrder.customer = {};

        res.send(objOrder);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.put('/', async (req, res) => {
    try {
        let productItem;
        let order = await Salesorder.findOne({ _id: req.body._id }).select('-__v');
        let bodyObj = req.body;

        //Ajustando o objeto a ser salvo
        delete bodyObj._id;
        if (!bodyObj.productItemList) bodyObj.productItemList = [];
        if (!bodyObj.paymentList) bodyObj.paymentList = [];

        //Liberando itens do estoque
        let allProductitems = [];
        for (let i = 0; i < bodyObj.productItemList.length; i++)
            allProductitems = allProductitems.concat(bodyObj.productItemList[i].codProductitem);

        let allProductitemsOriginal = [];
        for (let i = 0; i < order.productItemList.length; i++)
            allProductitemsOriginal = allProductitemsOriginal.concat(order.productItemList[i].codProductitem);

        for (let i = 0; i < allProductitemsOriginal.length; i++) {
            let found = false;
            for (let j = 0; j < allProductitems.length; j++) {
                if (allProductitemsOriginal[i] == allProductitems[j]) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                productItem = await Productitem.findOne({ codProductitem: allProductitemsOriginal[i] });
                productItem.place = 'SHELF';
                productItem.codSalesorder = undefined;
                await productItem.save();
            }
        }

        //Reservando itens do pedido
        await Productitem.updateMany(
            { codProductitem: { $in: allProductitems } },
            { place: 'RESERVED', codSalesorder: bodyObj.codOrder });

        order = await order.updateOne(bodyObj);
        res.send(order);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/closeOrder', async (req, res) => {
    try {
        let order = await Salesorder.findOne({ _id: req.body._id }).select('-__v');
        let bodyObj = req.body;

        //Ajustando o objeto a ser salvo
        delete bodyObj._id;

        //Liberando itens do estoque
        let allProductitems = [];
        for (let i = 0; i < bodyObj.productItemList.length; i++)
            allProductitems = allProductitems.concat(bodyObj.productItemList[i].codProductitem);

        //Reservando itens do pedido
        await Productitem.updateMany(
            { codProductitem: { $in: allProductitems } },
            { place: 'SOLD', codSalesorder: bodyObj.codOrder });

        bodyObj.status = 'CLOSED';
        order = await order.updateOne(bodyObj);
        res.send(order);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/cancelOrder', async (req, res) => {
    try {
        let order = await Salesorder.findOne({ _id: req.body._id }).select('-__v');

        //Retornando itens para o estoque
        await Productitem.updateMany(
            { codSalesorder: order.codOrder },
            { place: 'STORAGE' });

        order.status = 'RETURNED';
        order.obs = req.body.obs;
        order = await order.save();
        res.send(order);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/productItem/filter', async (req, res) => {
    try {
        const products = await Product.find(req.body).select('-__v');
        let item;
        const prdList = [];

        for (let i = 0; i < products.length; i++) {
            item = products[i].toJSON();
            item.productItems = await Productitem.find({ 
                codProduct: products[i].codProduct, 
                $or: [{place: 'SHELF' }, {place: 'STORAGE'}],
            });
            if (item.productItems.length > 0) prdList.push(item);
        }

        res.send(prdList);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;