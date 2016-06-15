const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static('public'));
app.use(bodyParser.json());

const apiRouter = require('./api');
app.use('/api', apiRouter(io));

io.on('connection', socket => {
    console.log('New connection');
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
