const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const User = require('./models/user');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser('secret'));
app.use(cookieSession({
    keys: ['azerty', 'qwerty']
}));

const apiRouter = require('./api');
app.use('/api', apiRouter);
app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
        username
    }).then(user => {
        console.log(user);
    }).catch(err => {
        res.status(500).end();
    })
    res.send('Hello World!');
});

/*const {
    hash,
    compare
} = require('bcrypt-nodejs');

hash(data, salt, progress, (err, res) => {
    if (err) {
        reject(err);
    } else {
        resolve(res);
    }
});

compare(data, encrypted, (err, res) => {
    if (err) {
        reject(err);
    } else {
        resolve(res);
    }
});*/

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
