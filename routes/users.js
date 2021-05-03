const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');

//registration form
router.get('/register', users.renderRegister)

//registering a new user
//note: we have our general error handler for mongoose errors via catchAsync fxn
//but we also are doing an add'l try/catch to more elegantly handle issues
//(ie someone is trying to create an account with an existing username)
router.post('/register', catchAsync(users.register));

//form to log in
router.get('/login', users.renderLogin)

//logging in
//use passport middleware .authenticate(STRATEGY, OPTIONS)
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

//logging out
router.get('/logout', users.logout)

module.exports = router;