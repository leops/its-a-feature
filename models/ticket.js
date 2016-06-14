const mongoose = require('mongoose');
const {Schema} = mongoose;

const Comment = new Schema({
    content: String,
    creationDate: Date
});

const Ticket = new Schema({
    summary: String,
    description: String,
    priority: {
        type: String,
        enum: ['TRIVIAL', 'MINOR', 'MAJOR', 'CRITICAL', 'BLOCKER']
    },
    status: {
        type: String,
        enum: ['NEW', 'IN PROGRESS', 'DONE']
    },
    creationDate: Date,
    reporter: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    developer: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    comments: [Comment]
});

module.exports = mongoose.model('Ticket', Ticket);
