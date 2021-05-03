const express = require('express');

//NOTE: when using the express router to break up your routes,
//the /:id part of a route won't work as before
//b/c the router params and the req.params are separate things
//so, must use mergeParams below:
const router = express.Router({ mergeParams: true });
//the reason this ^ isn't a problem in our campgrounds routes
//is because the /:id is defined in the path still,
//unlike in the reviews routes where /:id is part of every route
//and isn't in the file at all but is in the index.js file
//as the default for every reviews route

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //will delete the reference to the review from the particular campground that holds a set of objectIds of reviews
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;