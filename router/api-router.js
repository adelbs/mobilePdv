const express = require('express');
const router = express.Router();

const userRouter = require('./ob1-user-router');
const customerRouter = require('./pdv-customer-router');
const categoryRouter = require('./pdv-category-router');
const productRouter = require('./pdv-product-router');
const productItemRouter = require('./pdv-productitem-router');
const orderRouter = require('./pdv-saleorder-router');

router.use('/user', userRouter);
router.use('/customer', customerRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/productitem', productItemRouter);
router.use('/order', orderRouter);

module.exports = router;