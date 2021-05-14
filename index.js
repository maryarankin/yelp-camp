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
const mongoSanitize = require('express-mongo-sanitize'); //this is a package to prevent mongo injection (when people type characters like $ and . in a search field that queries the database to create their own query; this package just prevents characters like that from being allowed; will delete the whole part of the query that includes these characters, but will still allow any other 'clean' parts of the query)
const helmet = require('helmet'); //for security - alters the http headers you get back when make a request - gives you more headers to make app more secure

const { campgroundSchema, reviewSchema } = require('./schemas')
const Review = require('./models/review');

const userRoutes = require('./routes/users');
const campgroundRoutes= require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo'); //to set up our session store to be saved to mongo instead of locally

//from our .env file; this is so we can connect to mongo atlas (cloud db - when we deploy we don't want to use our local version of mongo db anymore so use the mongo atlas service instead to host our db)
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

// what we were connecting to (local db):
// mongodb://localhost:27017/yelp-camp 

//now, connect to dbUrl - this is the only thing we need to change when moving our db to production
mongoose.connect(dbUrl, {
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
app.use(mongoSanitize());
app.use(helmet()); //enables the 11 middleware helmet comes with
//then, have to change the default for contentSecurityPolicy from helmet or else it won't let us load things like external images/js/bootstrap
//you can specify a list of acceptable sources for different types of media and helmet will prevent anything that's not from one of those sites from loading on your page

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
];
const fontSrcUrls = [];

//configure the contentSecurityPolicy with arrays of sources above:
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfncl4mbo/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//note: could also download some of the files above instead so they're local and would count as "self" and would automatically be allowed

const secret = process.env.SECRET || 'thisshouldbeabettersecret' //development version

const store = MongoStore.create({
    mongoUrl: dbUrl, //mongo url
    secret: secret,
    touchAfter: 24 * 60 * 60 //prevents saves when nothing has changed
})

store.on("error", function(e) {
    console.log("Session store error", e)
})

//to make cookies!
const sessionConfig = {
    store: store, //could also just do 'store' instead of 'store: store'; b/c we defined this store above, we're now using mongo to store our info instead of storing it in memory locally
    name: 'session', //instead of default name (connect.sid) - this helps with security b/c hacker might otherwise try to take all connect.sid cookies
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: { //giving our cookies some options
        httpOnly: true, //a small secret thing (this is the default to be true anyway but set it just in case); means our cookies aren't accessible thru javascript (only http) so it's safer in preventing hackers trying to extract cookies
        //secure: true, //won't work until you're deployed - won't show you as logged in; this makes it go thru https (which localhost won't let you do) 
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

const port = process.env.PORT || 3000; //process.env.PORT will be automatically set thru heroku; OR if in development, use 3000
app.listen(port, () => {
    console.log(`serving on port ${port}`);
})

//notes on deploying: downloaded heroku cli then pushed changes via git to heroku using "git push heroku master" (after doing git add and git commit of course)
//then can run "heroku logs --tail" to see any error msgs
//just like how we do nodemon index.js we have to tell heroku where to start - go to package.json and add to scripts there

//have to configure env variables
//can do 2 ways:
//go to heroku site dashboard, go to settings, add config vars there
//or from command line: "heroku config:set SECRET="
//have to whitelist the ip address from heroku to allow it for mongo atlas; but heroku uses lots of ips so just go to mongo atlas and select 'allow access from anywhere'