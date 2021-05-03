const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//making our own middleware to protect routes when not logged in:

module.exports.isLoggedIn = (req, res, next) => {
    //gives you deserialized info from the session - passport gives us .user method so we don't have to get the user id etc from the session info ourselves:
    //console.log("req.user...", req.user); //gives you _id, email, & username, & undefined if not signed in
//.isAuthenticated method is coming from passport (built in method)
    //this protects the route (ie, the form), but you could still send in a request via postman and it would work (for now)
    if(!req.isAuthenticated()) {
        //store the url they're requesting & redirect there after directing them to login page
        //store it on the session to keep statefulness between requests
        //console.log(req.path, req.originalUrl);
        //if send request to campgrounds/new:
        //req.path would be /new and req.originalUrl would be campgrounds/new
        //storing on session:
        req.session.returnTo = req.originalUrl;
        
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login'); //must return so the res.render below doesn't run
    }
    next();
}

//middleware for using joi: (don't do an app.use b/c don't want it to run on each request)
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //campgroundSchema was defined in schemas.js file
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //join b/c turning array into a string and need a comma to join if there's more than one message
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//middleware to see if the author of a campground is the currently logged in user:
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//check if a review was written by the current user
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params; //'id' is for campground; 'reviewId' is for review; need 'id' for the redirect route below
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

