/**
 * This file is responsible for authenticating user requests
 * using JSON Web Tokens.
 * 
 * TODO
 */
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let secret = 'super-secret';

let mongoose = require('mongoose');


function isAuthenticated() {
    return false;    
}

function authenticateUser(email, password) {
    return false;
}

function registerUser(email, password) {
    // User.create({
    //     name: req.body.name,

    // })
    
    // let token = jwt.sign({
    //     id: 
    // });
}