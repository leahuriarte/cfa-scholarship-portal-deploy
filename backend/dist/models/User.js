"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String },
        dateOfBirth: { type: Date },
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: {
        token: String,
        expiresAt: Date,
    },
    resetPasswordToken: {
        token: String,
        expiresAt: Date,
        used: { type: Boolean, default: false },
    },
}, { timestamps: true });
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { password, __v, ...sanitized } = ret;
        return sanitized;
    },
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
