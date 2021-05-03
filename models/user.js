//create user model for authentication
//install passport, passport-local, & passport-local-mongoose thru npm
//note: passport doesn't use bcrypt, uses a different password hashing fxn
//passport creates salt & hash fields behind the scenes and stores the password for you

const mongoose = require('mongoose');
const Schema = mongoose.Schema; //not required, just for consistency with other models
const passportLocalMongoose = require('passport-local-mongoose');

//we want the user model to have email, username, & password, but only put email here for now
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true //not considered a validation
    }
})

UserSchema.plugin(passportLocalMongoose);
    //will add a username & password field to our user schema, will make sure usernames aren't duplicated, and will give us additional methods to use

module.exports = mongoose.model('User', UserSchema);