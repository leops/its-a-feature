const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const apiRouter = require('./api');
app.use('/api', apiRouter);

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/#/login');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
