const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const Ticket = require('./models/ticket');
const jwt = require('jsonwebtoken');

const {
    compare
} = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/test');

module.exports = router = express.Router();

router.route('/login')
    .post((req, res) => {
        const name = req.body.username;
        const password = req.body.password;

        User.findOne({
            name
        }).then(user => {
            if(user === null){
                res.status(404).end();
            }

            compare(password, user.password, (err, isValid) => {
                if (err) {
                    console.error(err);
                    res.status(500).end();
                } else if(!isValid) {
                    res.status(403).end();
                } else {
                    const token = jwt.sign({
                        sub: user._id
                    }, 'secret');
                    res.json({
                        token
                    });
                }
            });

        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    });

router.route('/tickets')
    .get((req, res) => {
        Ticket.find()
            .populate('reporter')
            .populate('developer')
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                console.error(err);
                res.status(500).end();
            });
    })
    .post((req, res) => {
        if (!req.body.summary || !req.body.description || !req.body.priority || !req.body.token) {
            res.status(400).end();
            return;
        }

        const {
            sub
        } = jwt.verify(req.body.token, 'secret');

        Ticket.create({
            summary: req.body.summary,
            description: req.body.description,
            priority: req.body.priority.toUpperCase(),
            status: 'NEW',
            creationDate: new Date(),
            reporter: sub
        }).then(({_id}) => {
            res.json({
                id: _id
            });
        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    });

router.route('/tickets/:ticket')
    .get((req, res) => {
        Ticket.findById(req.params.ticket)
            .then(docs => {
                res.json(docs);
            });
    })
    .patch((req, res) => {
        Ticket.findByIdAndUpdate(req.params.ticket, req.body)
            .then(() => {
                res.status(200).end();
            }).catch(err => {
                console.error(err);
                res.status(500).end();
            });
    })
    .delete((req, res) => {
        Ticket.findByIdAndRemove(req.params.ticket)
            .then(() => {
                res.status(200).end();
            }).catch(err => {
                console.error(err);
                res.status(500).end();
            });
    });
