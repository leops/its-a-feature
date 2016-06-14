const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const User = require('./models/user');
const {
    compare
} = require('bcrypt-nodejs');

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
    const name = req.body.username;
    const password = req.body.password;
    User.findOne({
        name
    }).then(user => {
        if(user === null){
            res.redirect('/#/login');
        }
        compare(password, user.password, (err, isValid) => {
            if (err || !isValid) {
                res.redirect('/#/login');
            } else {
                req.session.user = user._id;
                res.redirect('/#');
            }
        });

    }).catch(err => {
        res.status(500).end();
    });
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/#/login');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
