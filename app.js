const express = require('express');
const apiRouter = require('./api');

const app = express();

app.use(express.static('public'));
app.use('/api', apiRouter);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
