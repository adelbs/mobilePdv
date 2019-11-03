const log = require('../helper/logger');
const { Category } = require('../model/pdv-cd-category');
const { Product } = require('../model/pdv-cd-product');
const { Productitem } = require('../model/pdv-cd-productitem');
const express = require('express');
const router = express.Router();

function addStatus(status, statusTxt, arrObj, item) {
    if (item[status].length > 0) {
        const i = arrObj.length;
        arrObj[i] = {};
        for (let attr in item) arrObj[i][attr] = item[attr];
        arrObj[i].qtd = item[status].length;
        arrObj[i].status = statusTxt;
    }
}

router.post('/filter', async (req, res) => {
    try {
        let result = [];
        let resultGroup = [];

        let filterCategory = (req.body.codCategory ? { inactive: '', codCategory: req.body.codCategory } : { inactive: '' });
        let filterPlace = {};

        const categories = await Category.find(filterCategory);
        const products = await Product.find(filterCategory);
        let productItems = [];

        let categoryList = [];
        categories.forEach(category => categoryList[category.codCategory] = category.name);

        for (let i = 0; i < products.length; i++) {
            let index = result.length;
            result[index] = {
                codProduct: products[i].codProduct,
                category: categoryList[products[i].codCategory],
                name: products[i].name,
                STORAGE: [],
                SHELF: [],
                RESERVED: [],
                SOLD: [],
                CANCELED: []
            };

            filterPlace = { codProduct: products[i].codProduct };
            if (req.body.status) filterPlace.place = req.body.status;

            productItems = await Productitem.find(filterPlace);
            productItems.forEach(item => {
                if (item.codProduct == products[i].codProduct) {
                    result[i][item.place].push(item);
                }
            });
        }

        result.forEach(item => {
            addStatus('STORAGE', 'Em estoque', resultGroup, item);
            addStatus('SHELF', 'No expositor', resultGroup, item);
            addStatus('RESERVED', 'Reservado', resultGroup, item);
            addStatus('SOLD', 'Vendido', resultGroup, item);
            addStatus('CANCELED', 'Cancelado', resultGroup, item);
        });

        res.send(resultGroup);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;