const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

//moved some logic from the routes to controllers/campgrounds

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

//user shouldn't encounter this route if not logged in anyway (b/c won't be able to get to form), but user could technically send the request via postman so want to prevent that with isLoggedIn middleware
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

//note: the one with /:id must be last b/c otherwise it thinks /campgrounds/new has an id of 'new'
router.get('/:id', catchAsync(campgrounds.showCampground))

module.exports = router;