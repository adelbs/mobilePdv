const log = require('../helper/logger');
const { Product } = require('../model/pdv-cd-product');
const { Productitem } = require('../model/pdv-cd-productitem');
const { next } = require('../helper/sequence');
const express = require('express');
const router = express.Router();

router.post('/filter', async (req, res) => {
    try {
        const products = await Product.find();
        let product;
        let resultList = [];

        for (let i = 0; i < products.length; i++) {
            product = products[i].toJSON();
            product.storage = await Productitem.find({ codProduct: product.codProduct, place: 'STORAGE' });
            product.shelf = await Productitem.find({ codProduct: product.codProduct, place: 'SHELF' });
            resultList.push(product);
        }

        res.send(resultList);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/move', async (req, res) => {
    try {
        const itemList = req.body.data;
        let productItem;

        for (let i = 0; i < itemList.length; i++) {
            productItem = await Productitem.findOne({ _id: itemList[i]._id }).select('-__v');
            delete itemList[i]._id;
            await productItem.updateOne(itemList[i]);
        }

        res.send('ok');
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/add', async (req, res) => {
    try {
        const bodyObj = req.body;
        let productItem;

        for (let i = 0; i < bodyObj.qtd; i++) {
            productItem = new Productitem({ codProduct: bodyObj.codProduct });
            productItem.codProductitem = await next(Productitem);
            await productItem.save();
        }

        res.send('ok');
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;