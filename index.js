//environment variables
//so you can store confidential things like cloudinary credentials, for ex
//create a file called .env at the top level of this folder
//npm i dotenv
//inside .env file, create key value pairs (ie SECRET=fjdksljfe)
//can access them thru dotenv

if(process.env.NODE_ENV !== "production") { //we run in development mode by default
    require('dotenv').config(); //will add variables defined in the .env file into process.env.NODE_ENV in this node app
}
//process.env.NODE_ENV is an environment variable that is either development or production
//in production, there's another way to do it - don't store them in a file but in the environment...
//when uploading this code to github, for ex, don't include the .env file in your upload
//if someone from github uses your code, they just have to put in their own local environment variables

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //an engine that helps us with ejs layouts
const session = require('express-session'); //install express-session to use flash messages & for authentication
const flash = require('connect-flash'); //to make flash messages etc
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport'); //adding passport in general
const LocalStrategy = require('passport-local'); //adding passport-local strategy specifically
const User = require('./models/user')
//const Joi = require('joi'); //server side validation to prevent errors/specify which data is required for a form
//note: don't actually need joi in this file anymore b/c not using it here

const { campgroundSchema, reviewSchema } = require('./schemas')
const Review = require('./models/review');

const userRoutes = require('./routes/users');
const campgroundRoutes= require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false //to make deprecation warning go away
});

const db = mongoose.connection; //declare variable db so don't have to type 'mongoose.connection' each time below:
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const app = express();

app.engine('ejs', ejsMate); //must tell express to use the ejs-mate engine rather than the default ejs engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
//to serve our static directory:
app.use(express.static(path.join(__dirname, 'public')));

//to make cookies!
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: { //giving our cookies some options
        httpOnly: true, //a small secret thing (this is the default to be true anyway but set it just in case)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //this will make cookie expire after a week (Date.now() is in milliseconds so multiply by 1000 to get seconds, 60 to get mins, etc.)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
//for flash:
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //for persistent login session (so don't have to log in on each request)
//note: make sure app.use(session()) comes before app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())); //the authenticate method was added to our User model when we did our UserSchema.plugin() in the user model file
passport.serializeUser(User.serializeUser()); //another method added to User schema - this tells it how to store a user in the session
passport.deserializeUser(User.deserializeUser()); //how to get user info from the session ('unstore' it)

//define middleware to add our flash message to be available for all templates (do this before the routes (campgrounds & reviews) below):
//will be available on every single request
app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.currentUser = req.user; //comes from passport; put this here so it's available in every template
    res.locals.success = req.flash('success'); //so, can just use variable name 'success' in any template where you want the msg to be displayed
    res.locals.error = req.flash('error');
    next();
})
//note: order is important - originally had the above app.use before the passport.initialize() & passport.session() fxns and it didn't work

//using the /campgrounds routes from the campgrounds file in the routes folder:
app.use('/campgrounds', campgroundRoutes);

//using the /reviews routes from the reviews file in the routes folder
app.use('/campgrounds/:id/reviews', reviewRoutes);

//using userRoutes
app.use('/', userRoutes);

//manual test to use passport to make a user/password:
// app.use('/fakeuser', async (req, res) => {
//     const user = new User({email: 'mary@mary.com', username: 'mary'});
//     const newUser = await User.register(user, '12345'); //pass user object & password into this .register method, will allow pw to be added & will check if username is unique & will hash & store pw
//     res.send(newUser);
// })

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {  //for all requests and all paths (that don't match one of the above defined ones)
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'; //if just create a default value like above (w/ statusCode = 500 ), you're not actually changing the value of err.message, you're just changing the VARIABLE called message's value locally
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('serving on port 3000');
})