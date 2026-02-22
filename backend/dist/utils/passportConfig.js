"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const bcryptHash_1 = require("../utils/bcryptHash");
const User_1 = __importDefault(require("../models/User"));
// Set up Passport local strategy for authentication
// Do we require username, email, or password to sign in? Or any of the above?
// We probably want a strategies folder if we plan to add oauth in addition to local.
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const userWithPassword = await User_1.default.findOne({ email }).select('+password').exec();
        if (!userWithPassword)
            return done(null, false, { message: 'Email or password is incorrect' });
        const isMatch = await (0, bcryptHash_1.comparePassword)(password, userWithPassword.password);
        if (!isMatch)
            return done(null, false, { message: 'Email or password is incorrect' });
        const sanitizedUser = await User_1.default.findById(userWithPassword._id).exec();
        if (!sanitizedUser) {
            // extremely unlikely: user was removed between queries
            return done(new Error('Authenticated user missing from database'));
        }
        return done(null, sanitizedUser);
    }
    catch (err) {
        return done(err);
    }
}));
// Stores the authenticated user in the session. Not the entire object since that has privacy concerns.
passport_1.default.serializeUser((user, done) => done(null, user.id));
// Uses the session id to attach the corresponding user object to req.user
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.default.findById(id).exec();
        if (!user)
            return done(new Error('User not found'));
        done(null, user); // Reattach the full user object to req.user
    }
    catch (err) {
        done(err);
    }
});
exports.default = passport_1.default;
