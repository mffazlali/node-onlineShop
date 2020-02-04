const { ObjectID } = require('mongodb');
const { mongoose } = require('../db/mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

var output = {
    responseCode: 0,
    responseMessage: "not found",
    result: null
}

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        default: 0,
    },
    password: {
        type: String,
        required: true,
        default: 0,
    },
    token: {
        type: String,
        required: true,
        default: null,
    },
    expireDate: {
        type: String,
        required: true,
        default: null,
    },
});
userSchema.methods.toJSON = function () {
    var user = this;
    userObject = user.toObject();
    return {
        responseCode: 0,
        responseMessage: "عملیات با موفقیت انجام شد",
        result: userObject
    }
}
userSchema.methods.generateToken = function () {
    var user = this;
    var date = new Date();
    var time = date.getHours() + '' + date.getMinutes();
    var token = user.token;
    if (user.expireDate == null || user.expireDate < time) {
        var token = jwt.sign({ _id: user._id.toHexString(), expireDate: time }, '123456').toString();
        var expireDate = time;
        user.token = token;
        user.expireDate = expireDate;
    }

    return user.save().then(() => {
        return token
    });
}
userSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({ email, password }).then(user => {
        return new Promise((resolve, reject) => {
            if (user == null) {
                reject({
                    responseCode: 404,
                    responseMessage: "خطا در فراخوانی سرویس",
                    result: null
                });
            } else {
                resolve(user);
            }
        })
    }, error => {
        return Promise.reject(error);
    });
}
userSchema.statics.findByUserWithToken = function (token) {
    var User = this;
    var date = new Date();
    var time = Number(date.getHours() + '' + date.getMinutes());
    var { _id } = jwt.verify(token, '123456');
    return User.findOne({ _id: new ObjectID(_id) }).then(user => {
        return new Promise((resolve, reject) => {
            if (user == null) {
                reject({
                    responseCode: 404,
                    responseMessage: "خطا در فراخوانی سرویس",
                    result: null
                })
            } else {
                let result = null
                if (Number(user.expireDate) < time) {
                    result = ({
                        responseCode: 400,
                        responseMessage: "خطا در فراخوانی سرویس",
                        result: false
                    })
                } else {
                    result = ({
                        responseCode: 0,
                        responseMessage: "عملیات با موفقیت انجام شد",
                        result: true
                    })
                }
                resolve(result);
            }
        });
    }, error => {
        return Promise.reject(error);
    });
}

var User = mongoose.model("User", userSchema);

module.exports = { User }