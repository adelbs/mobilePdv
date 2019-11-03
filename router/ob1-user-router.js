const log = require('../helper/logger');
const { User } = require('../model/ob1-cd-user');
const { next } = require('../helper/sequence');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-__v');
        res.send(users);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/filter', async (req, res) => {
    try {
        const user = await User.find(req.body).select('-__v');
        res.send(user);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id }).select('-__v');
        res.send(user);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id }).select('-__v');
        res.send({ message: 'Deleted' });
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.post('/', async (req, res) => {
    try {
        let user = new User(req.body);

        user.codUser = await next(User);

        user = await user.save();
        res.send(user.toJSON());
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

router.put('/', async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.body._id }).select('-__v');
        delete req.body._id;
        user = await user.updateOne(req.body);
        res.send(user);
    }
    catch (err) {
        log.error(`Error!`, err, req);
        res.status(400).send(err);
    }
});

module.exports = router;