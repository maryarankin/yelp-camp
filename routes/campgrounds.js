const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer  = require('multer'); //for parsing a multipart form (with uploaded files like images)
const { storage } = require('../cloudinary'); //don't have to do /index b/c node knows to look for index file first
//from the docs, had:
//const upload = multer({ dest: 'uploads/' });
//but, we actually want to store not locally in an uploads folder but in cloudinary instead
const upload = multer({ storage });

//moved some logic from the routes to controllers/campgrounds
//then grouped similar routes

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) //'image' comes from the field name on our form
    //test post route when adding image upload functionality; then later returned to the original route above, except with the upload.array middleware added
    // .post(upload.array('image'), (req, res) => { //upload.single() is a middleware that comes from multer; have 2 parts of the request: file & body (all the other text stuff that's submitted)
    //     console.log(req.body, req.files); //req.body is the regular text fields; req.file is info about the file that was uploaded
    //     res.send("it worked");
    // })

//don't need to group this one b/c it's a standalone
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
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