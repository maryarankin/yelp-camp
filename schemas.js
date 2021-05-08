//our joi schemas

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');


//cross-site scripting: people can insert html tags/scripts into fields on your site and change what shows up, have users click links that contain scripts in the url that have the user send a req to the hacker's server and simultaneously send the hacker cookies, etc.
//to stop this, must sanitize html
//joi is what we're using for our validations
//joi doesn't include built-in sanitization methods
//must write our own
//in joi you can write extensions (your own code) and add them to your joi validations:
//install npm i sanitize-html
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { //sanitizeHtml is a fxn from the package sanitize-html
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value}) //if something was removed, returned the error msg defined above
                return clean;
            }
        }
    }
})

//add extension to Joi
const Joi = BaseJoi.extend(extension);

//then put .escapeHTML() on all of the string properties below:

module.exports.campgroundSchema = Joi.object({ //this isn't a mongoose schema - a joi schema
    campground: Joi.object({   //everything is nested under campground
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array() //had to add this to be allowed to delete images
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})