import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        minLength: 2,
        type: String,
        required: true,
        maxLength: 500,
    },
    email: {
        minLength: 10,
        type: String,
        required: true,
        unique: true,
        maxLength: 500,
    },
    headline: {
        minLength: 1,
        type: String,
        required: false,
        maxLength: 100,
    },
    profilePath : {
        minLength : 10,
        type : String,
        required : false,
        maxLength : 10000,
    },
    password: {
        minLength: 8,
        type: String,
        required: true,
        maxLength: 200,
    },
    agreeTerms: {
        type: Boolean,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    sentEmailLinkExpire: {
        type: Number,
        default: 0,
    }
});

const User = mongoose.model('user', userSchema);

export default User;
