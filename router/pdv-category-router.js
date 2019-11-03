const log = require('../helper/logger');
const { Category } = require('../model/pdv-cd-category');
const { next } = require('../helper/sequence');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const category = await Category.find().select('-__v');
        res.send(category);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/filter', async (req, res) => {
    try {
        const category = await Category.find(req.body).select('-__v');
        res.send(category);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id }).select('-__v');
        res.send(category);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Category.deleteOne({ _id: req.params.id }).select('-__v');
        res.send({ message: 'Deleted' });
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/', async (req, res) => {
    try {
        let category = new Category(req.body);

        category.codCategory = await next(Category);

        category = await category.save();
        res.send(category.toJSON());
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.put('/', async (req, res) => {
    try {
        let category = await Category.findOne({ _id: req.body._id }).select('-__v');
        delete req.body._id;
        category = await category.updateOne(req.body);
        res.send(category);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;