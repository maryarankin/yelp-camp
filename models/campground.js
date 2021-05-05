const mongoose = require('mongoose');
const Review = require('./review'); //so you can use the middleware to delete a campground's reviews when campground is deleted, which is below
//just a shortcut so you don't have to type out 'mongoose.Schema' every time:
const Schema = mongoose.Schema;

//https://res.cloudinary.com/dfncl4mbo/image/upload/w_200/v1620171839/YelpCamp/gjtxhnyl9sogxrj40asi.jpg

//creating a separate image schema so we can add /w_200/ to the url above (after /upload/) so we can use the built in cloudinary transformations (ie, specifying an image width so we can have thumbnails)
//note: only need an image schema, not an image model
//mongo allows us to add a "virtual property", which is what we're going to do to each of our images
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//this is virtual b/c we don't need to store it on the model or in the database b/c it's derived from the information we're already storing
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200'); //'this' refers to the particular image
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema], //moved out of here into its own schema; can't create virtual property here b/c it's an ARRAY of images
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

CampgroundSchema.post('findOneAndDelete', async function (doc) { //this is a post (after) query middleware that will run whenever findOneAndDelete is run; when a campground is deleted, this will run to delete our comments; doc is what was just deleted, so passing that in allows us to capture that data
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews  //deleting all reviews that have an id that was part of the doc (campground) that was just deleted
            }
        })
    }
}) //note:  currently deleting campgrounds with findByIdAndDelete; that's why 'findOneAndDelete' middleware works above; BUT, if you change the method for deleting, you have to use mongoose docs to find the new compatible middleware

module.exports = mongoose.model('Campground', CampgroundSchema);

