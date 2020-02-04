const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./db/mongoose');
const { User } = require('./models/user.model');

console.clear();
var app = express();

app.use(bodyParser.json());

app.post("/login", (req, res) => {
    var user = new User({ email: req.body.email, password: req.body.password });
    User.findByCredentials(req.body.email, req.body.password).then(user => {
        user.generateToken();
        return res.status(200).send(user);
    }).catch(error => {
        return res.status(400).send(error);
    });
});

app.post("/token", (req, res) => {
    User.findByUserWithToken(req.body.token).then(result => {
        return res.status(200).send(result)
    }).catch(error => {
        return res.status(400).send(error);
    })
})

app.listen(3000, () => {
    console.log('Starting on port 3000');
})