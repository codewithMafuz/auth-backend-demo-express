import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    headline: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true
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
