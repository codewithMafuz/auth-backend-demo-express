import mongoose from 'mongoose'

const passwordResetRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    resetId: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Number,
        default: 0,
    },
});

const PasswordResetRequest = mongoose.model('passwordResetRequest', passwordResetRequestSchema);

export default PasswordResetRequest