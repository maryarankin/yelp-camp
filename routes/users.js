const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');

//registration form
router.get('/register', (req, res) => {
    res.render('users/register');
})

//registering a new user
//note: we have our general error handler for mongoose errors via catchAsync fxn
//but we also are doing an add'l try/catch to more elegantly handle issues
//(ie someone is trying to create an account with an existing username)
router.post('/register', catchAsync(async(req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username }); //create new instance of a user
        const registeredUser = await User.register(user, password); //pass in the instance of the user and a password and it'll store user & salt/hash password
        //console.log(registeredUser);
        //log in the user immediately after they register so they don't have to log in again themselves
        req.login(registeredUser, err => { //have to pass in an error as a callback - required for using the .login method, even though not likely that you'd need it
            if(err) return next(err); //will hit our error handler (had to add next above as a param for this post route)
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register'); //so you can try again
    }
}));

//form to log in
router.get('/login', (req, res) => {
    res.render('users/login')
})

//logging in
//use passport middleware .authenticate(STRATEGY, OPTIONS)
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    //if we make it into this route, we know the user was properly authenticated
    req.flash('success', 'Welcome back!');

    //the returnTo stored on the session (see middleware.js file) to remember where the user was trying to go before logging in
    //they could also just try to log in by clicking login button, so if there's nothing saved on .returnTo, direct to /campgrounds instead
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo; //so it won't stay after
    res.redirect(redirectUrl);
})

//logging out
router.get('/logout', (req, res) => {
    req.logout(); //this is a method from passport
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

module.exports = router;