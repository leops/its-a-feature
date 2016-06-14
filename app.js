const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser('secret'));
app.use(cookieSession({
    keys: ['azerty', 'qwerty']
}));

const apiRouter = require('./api');
app.use('/api', apiRouter);

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
