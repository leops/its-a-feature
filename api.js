const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect('mongodb://localhost/test');

module.exports = router = express.Router();

