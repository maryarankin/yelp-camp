//run this file on its own any time we want to seed our database
//run as 'node seeds/index.js'

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection; //declare variable db so don't have to type 'mongoose.connection' each time below:
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

//returning a random element from an array:
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000); //b/c there are 1000 cities in the array
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '609027581cd85826ef7aa638', //added this in once we created user model so we can associate each campground with a user; this is the id for a random acct I made (maryarankin) so each campground will now have a user associated with it
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251', //unsplash's api will give us a random img from the collection 'in the woods' with this url; note: the image will change each time you visit a campground page b/c it's not storing the image itself, it's only storing the url
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut, soluta! Consequuntur vel at animi maiores recusandae repudiandae quas saepe, iusto, quam modi fugiat dolor voluptates culpa, suscipit itaque odit voluptatem?',
            price, //can do shorthand - don't need to type out price: price
            //two of the images we uploaded to cloudinary:
            images: [
                {
                  url: 'https://res.cloudinary.com/dfncl4mbo/image/upload/v1620171839/YelpCamp/gjtxhnyl9sogxrj40asi.jpg',
                  filename: 'YelpCamp/gjtxhnyl9sogxrj40asi'
                },
                {
                  url: 'https://res.cloudinary.com/dfncl4mbo/image/upload/v1620171842/YelpCamp/tnu0ohra1yxlohyxkqwq.jpg',
                  filename: 'YelpCamp/tnu0ohra1yxlohyxkqwq'
                }
              ]
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close()
}) //to close connection when you're done