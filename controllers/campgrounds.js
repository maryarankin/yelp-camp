const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    //note: we are requiring this data to be filled out via the form thru html/bootstrap, but can still send a post request ie via postman, so this will prevent any post request from being submitted without the fields being all filled out
    //or use joi instead: added via middleware fxn validateCampground (see above)
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; //req.user comes from passport - who is currently logged in; create this so each new campground has an author associated with it
    await campground.save();
    //flash message (then must display in our template):
    //note: it is made available to all of our templates in index.js as a middleware fxn
    req.flash('success', 'Successfully created a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    //const { id } = req.params;   shorter way:
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', //populate reviews for the campground
        populate: { //then, on each review, populate THE REVIEW'S author
            path: 'author'
        } //note: to scale the app, may want to store the username itself on a review instead of the user object to make things more efficient; storing the user object, however, allows you to use other info about the user if necessary
    }).populate('author'); //then, populate the CAMPGROUND'S author
    //flashing an error message (ie if you bookmarked a page with the campground id and then the campground got deleted)
    if(!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { runValidators: true });
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}