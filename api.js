const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const Ticket = require('./models/ticket');
const jwt = require('jsonwebtoken');

const {
    compare
} = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/test');

module.exports = io => {
    const router = express.Router();

    router.route('/login')
        .post((req, res) => {
            const name = req.body.username;
            const password = req.body.password;

            User.findOne({
                name
            })
                .then(user => {
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

                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        });

    router.route('/tickets')
        .get((req, res) => {
            Ticket.find()
                .populate('reporter')
                .populate('developer')
                .populate('comments.author')
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
            })
                .then(post => {
                    io.emit('new-post', post);
                    res.json(post);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        });

    router.route('/tickets/:ticket')
        .get((req, res) => {
            Ticket.findById(req.params.ticket)
                .populate('reporter')
                .populate('developer')
                .populate('comments.author')
                .then(docs => {
                    res.json(docs);
                }).catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        })
        .post((req, res) => {
            Ticket.findById(req.params.ticket)
                .then(ticket => {
                    const {
                        sub
                    } = jwt.verify(req.body.token, 'secret');

                    ticket.comments.push({
                        content: req.body.content,
                        creationDate: new Date(),
                        author: sub
                    });

                    return ticket.save();
                })
                .then(() =>
                    Ticket.findById(req.params.ticket)
                        .populate('comments.author')
                )
                .then(ticket => {
                    const comment = ticket.comments[ticket.comments.length - 1];
                    io.emit('new-comment', comment);
                    res.json(comment);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        })
        .patch((req, res) => {
            Ticket.findByIdAndUpdate(req.params.ticket, req.body, {
                new: true
            })
                .populate('reporter')
                .populate('developer')
                .populate('comments.author')
                .then(ticket => {
                    res.json(ticket);
                }).catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        })
        .delete((req, res) => {
            Ticket.findByIdAndRemove(req.params.ticket)
                .then(() => {
                    res.status(200).end();
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).end();
                });
        });

    return router;
};
