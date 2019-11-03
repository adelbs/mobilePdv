const log = require('../helper/logger');
const { Customer } = require('../model/pdv-cd-customer');
const { next } = require('../helper/sequence');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().select('-__v');
        res.send(customers);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/filter', async (req, res) => {
    try {
        const customer = await Customer.find(req.body).select('-__v');
        res.send(customer);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id }).select('-__v');
        res.send(customer);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Customer.deleteOne({ _id: req.params.id }).select('-__v');
        res.send({ message: 'Deleted' });
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/', async (req, res) => {
    try {
        let customer = new Customer(req.body);

        customer.codCustomer = await next(Customer);

        customer = await customer.save();
        res.send(customer.toJSON());
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.put('/', async (req, res) => {
    try {
        let customer = await Customer.findOne({ _id: req.body._id }).select('-__v');
        delete req.body._id;
        customer = await customer.updateOne(req.body);
        res.send(customer);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;