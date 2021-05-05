//npm i cloudinary
//npm i multer-storage-cloudinary (which helps make multer & cloudinary work together smoothly - ie when you upload a file multer will automatically have the new cloudinary urls for the imgs as part of the req.files)

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//associating our cloudinary acct with this instance of cloudinary:
cloudinary.config({
    //from our .env file:
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

//instantiating an instance of cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary, //the object we just configured
    params: {
        folder: 'YelpCamp', //the folder in cloudinary where we'll store things
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}