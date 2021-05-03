const mongoose = require('mongoose');
const Review = require('./review'); //so you can use the middleware to delete a campground's reviews when campground is deleted, which is below
//just a shortcut so you don't have to type out 'mongoose.Schema' every time:
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
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

