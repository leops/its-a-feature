const faker = require('faker');
const mongoose = require('mongoose');
const User = require('./models/user');
const {
    hash
} = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/test');

if(process.argv.length < 3) {
    console.error('You must pass a user type on the command line');
    process.exit(1);
}

const [,, type] = process.argv;

if(type !== 'Developer' && type !== 'ProductOwner') {
    console.error('The user type must be Developer or ProductOwner');
    process.exit(2);
}

const name = faker.internet.userName();
const pass = faker.internet.password();
const firstName = faker.name.firstName();
const lastName = faker.name.lastName();
const email = faker.internet.email();
const dateOfBirth = faker.date.past();

hash(pass, undefined, undefined, (err, password) => {
    if (err) {
        console.error(err);
    } else {
        User.create({
            name,
            password,
            firstName,
            lastName,
            email,
            dateOfBirth,
            type
        }).then(({_id}) => {
            console.log(`Created user ${name} of type ${type} with password ${pass}`);
            process.exit(0);
        }).catch(err => {
            console.error(err);
            process.exit(3);
        });
    }
});
