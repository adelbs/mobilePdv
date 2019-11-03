const log = require('../helper/logger');
const { Product } = require('../model/pdv-cd-product');
const { Productitem } = require('../model/pdv-cd-productitem');
const { next } = require('../helper/sequence');
const { currencyValue } = require('../helper/util');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find().select('-__v');
        let productObj;
        let result = [];

        for (let i = 0; i < products.length; i++) {
            productObj = products[i].toJSON();
            productObj.productItem = await Productitem.find({ codProduct: productObj.codProduct }).select('-__v');
            result.push(productObj);
        }

        res.send(result);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/filter', async (req, res) => {
    try {
        const products = await Product.find(req.body).select('-__v');
        res.send(products);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id }).select('-__v');

        let productObj = product.toJSON();
        productObj.productItem = await Productitem.find({ codProduct: product.codProduct }).select('-__v');

        res.send(productObj);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        let product = await Product.findOne({ _id: req.params.id }).select('-__v');
        await Productitem.deleteMany({ codProduct: product.codProduct });
        await product.remove();
        res.send({ message: 'Deleted' });
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/', async (req, res) => {
    try {
        let product = new Product(req.body);
        let productItem;

        product.codProduct = await next(Product);

        let itemList = req.body.productItem;
        if (itemList && itemList.length && itemList.length > 0) {
            for (let i = 0; i < itemList.length; i++) {
                productItem = new Productitem(itemList[i]);
                productItem.codProduct = product.codProduct;
                productItem.codProductitem = await next(Productitem);
                await productItem.save();
            }
        }

        product = await product.save();
        res.send(product.toJSON());
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.put('/', async (req, res) => {
    try {
        let product = await Product.findOne({ _id: req.body._id }).select('-__v');
        let productItem = [];

        let bodyObj = req.body;
        delete bodyObj._id;
        bodyObj.value = currencyValue(bodyObj.value);

        product = await product.updateOne(bodyObj);

        let productObj = bodyObj;

        let itemList = bodyObj.productItem;
        if (itemList && itemList.length && itemList.length > 0) {
            for (let i = 0; i < itemList.length; i++) {
                if (itemList[i]._id) {
                    productItem[i] = await Productitem.findOne({ _id: itemList[i]._id }).select('-__v');
                    delete itemList[i]._id;
                    await productItem[i].updateOne(itemList[i]);
                }
                else {
                    productItem[i] = new Productitem(itemList[i]);
                    productItem[i].codProduct = productObj.codProduct;
                    productItem[i].codProductitem = await next(Productitem);
                    await productItem[i].save();
                }
            }
        }

        res.send(productObj);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;