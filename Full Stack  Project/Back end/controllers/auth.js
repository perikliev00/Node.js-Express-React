const User = require('../models/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const hashPw = await bcrypt.hash(password, 12)
        const user = new User ({
            email: email,
            password: hashPw,
            name: name
        });
        await user.save();
        res.status(201).json({message: 'User created!', userId: user._id});
}
exports.login = async (req, res, next) => { 

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
    const user = await User.findOne({email: email})
        if(!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email:loadedUser.email,
                userId: loadedUser._id.toString()
            },
            '',
            {expiresIn: '1h'}
        );
        res.status(200).json({token: token, userId: loadedUser._id.toString()});
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}