const mongoose = require('mongoose');
const User = require('./models/user');
const {
    hash
} = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/test');

hash('yolo', undefined, undefined, (err, password) => {
    if (err) {
        console.error(err);
    } else {
        User.create({
            name: 'developer',
            password,
            firstName: 'Jean',
            lastName: 'Booster',
            email: 'JB@supinfo.com',
            dateOfBirth: new Date(),
            type: 'ProductOwner'
        }).then(({_id}) => {
            console.log(_id);
        }).catch(err => {
            console.error(err);
        });
    }
});
