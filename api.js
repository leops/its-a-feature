const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('./models/ticket');

mongoose.connect('mongodb://localhost/test');

module.exports = router = express.Router();

router.route('/tickets')
    .get((req, res) => {
        Ticket.find().then(docs => {
            res.json(docs);
        });
    })
    .post((req, res) => {
        Ticket.create({
            summary: req.body.summary,
            description: req.body.summary,
            priority: req.body.priority.toUpperCase(),
            status: 'NEW',
            creationDate: new Date(),
            reporter: req.session.user
        }).then(({_id}) => {
            res.status(200).json({
                id: _id
            });
        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    });

router.route('/tickets/:ticket')
    .get((req, res) => {
        Ticket.findById(req.params.ticket).then(docs => {
            res.json(docs);
        });
    })
    .patch((req, res) => {
        Ticket.findByIdAndUpdate(req.params.ticket, req.body).then(() => {
            res.status(200).end();
        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    })
    .delete((req, res) => {
        Ticket.findByIdAndRemove(req.params.ticket).then(() => {
            res.status(200).end();
        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    });
