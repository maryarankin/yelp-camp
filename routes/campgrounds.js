const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

//moved some logic from the routes to controllers/campgrounds
//then grouped similar routes

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

//don't need to group this one b/c it's a standalone
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;


//old way (not grouped together):

//router.get('/', catchAsync(campgrounds.index));

//router.get('/new', isLoggedIn, campgrounds.renderNewForm)

//user shouldn't encounter this route if not logged in anyway (b/c won't be able to get to form), but user could technically send the request via postman so want to prevent that with isLoggedIn middleware
//router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

//router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

//router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

//router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

//note: the one with /:id must be last b/c otherwise it thinks /campgrounds/new has an id of 'new'
//router.get('/:id', catchAsync(campgrounds.showCampground))

//module.exports = router;