const mongoose = require('mongoose');

const User = mongoose.Schema({
    name: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    dateOfBirth: Date,
    type: {
        type: String,
        enum: ['ProductOwner', 'Developer']
    }
});

module.exports = mongoose.model('User', User);
