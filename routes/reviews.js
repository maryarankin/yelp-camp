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
const reviews = require('../controllers/reviews');
const { reviewSchema } = require('../schemas');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;