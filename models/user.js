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
    phone: {
        type: String,
        default: 'N/A',
    },
    password: {
        type: String,
        required: true
    },
    recieveEmails: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('user', userSchema);

export default User;
