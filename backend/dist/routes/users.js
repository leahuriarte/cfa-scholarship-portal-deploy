"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const userValidation_1 = require("../validators/userValidation");
const bcryptHash_1 = require("../utils/bcryptHash");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Register
 * Body: { email, password, role?, profile?: { firstName, lastName, phone, dateOfBirth } }
 * or Body: { email, password, firstName, lastName, phone, dateOfBirth }
 */
router.post('/register', userValidation_1.createUserValidation, async (req, res) => {
    const r = req;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email, password, role, profile } = req.body;
    const profileData = profile ?? {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
    };
    const newUser = new User_1.default({
        email,
        password: await (0, bcryptHash_1.hashPassword)(password),
        role: role ?? undefined,
        profile: profileData,
    });
    try {
        await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;
        return res.status(201).json({ message: 'User registered successfully', user: userObj });
    }
    catch (err) {
        if (err?.code === 11000)
            return res.status(400).json({ message: 'Email is already taken.' });
        console.error(err);
        return res.status(500).json({ message: 'Error registering user' });
    }
});
/**
 * Login (Passport local)
 * Body: { email, password }
 */
router.post('/login', (req, res, next) => {
    const r = req;
    passport_1.default.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).json({ message: info?.message ?? 'Authentication failed' });
        r.login(user, (loginErr) => {
            if (loginErr)
                return next(loginErr);
            const safeUser = { ...(r.user?.toObject ? r.user.toObject() : r.user) };
            if (safeUser)
                delete safeUser.password;
            return res.json({ message: 'Login successful', user: safeUser });
        });
    })(req, res, next);
});
/**
 * Logout
 * Accessible to: authenticated users
 */
router.post('/logout', auth_1.ensureAuthenticated, (req, res) => {
    const r = req;
    if (r.isAuthenticated && r.isAuthenticated()) {
        r.logout((err) => {
            if (err)
                return res.status(500).json({ message: 'Error logging out' });
            r.session?.destroy((destroyErr) => {
                if (destroyErr)
                    return res.status(500).json({ message: 'Error destroying session' });
                return res.status(200).json({ message: 'Logout successful' });
            });
        });
    }
    else {
        return res.status(400).json({ message: 'No user is logged in' });
    }
});
/**
 * Status - get current authenticated user
 * Accessible to: authenticated users
 */
router.get('/status', auth_1.ensureAuthenticated, (req, res) => {
    const r = req;
    const safeUser = { ...(r.user?.toObject ? r.user.toObject() : r.user) };
    if (safeUser)
        delete safeUser.password;
    return res.json(safeUser);
});
/**
 * Change email
 * Body: { email }
 * Accessible to: authenticated users
 */
router.put('/change-email', auth_1.ensureAuthenticated, userValidation_1.changeEmailValidation, async (req, res) => {
    const r = req;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email } = req.body;
    if (!(r.isAuthenticated && r.isAuthenticated()))
        return res.status(401).json({ message: 'User not authenticated' });
    try {
        const found = await User_1.default.findById(r.user._id);
        if (!found)
            return res.status(404).json({ message: 'User not found' });
        found.email = email;
        await found.save();
        return res.status(200).json({ message: 'Email updated successfully' });
    }
    catch (err) {
        if (err?.code === 11000)
            return res.status(400).json({ message: 'Email is already taken' });
        console.error(err);
        return res.status(500).json({ message: 'Error updating email' });
    }
});
/**
 * Change password
 * Body: { password }
 * Accessible to: authenticated users
 */
router.put('/change-password', auth_1.ensureAuthenticated, userValidation_1.changePasswordValidation, async (req, res) => {
    const r = req;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { password } = req.body;
    if (!(r.isAuthenticated && r.isAuthenticated()))
        return res.status(401).json({ message: 'User not authenticated' });
    try {
        const found = await User_1.default.findById(r.user._id);
        if (!found)
            return res.status(404).json({ message: 'User not found' });
        found.password = await (0, bcryptHash_1.hashPassword)(password);
        await found.save();
        return res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error updating password' });
    }
});
/**
 * Update profile
 * Body: { profile: { firstName, lastName, phone, dateOfBirth } } OR top-level fields
 * Accessible to: authenticated users
 */
router.put('/profile', auth_1.ensureAuthenticated, userValidation_1.updateUserValidation, async (req, res) => {
    const r = req;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    if (!(r.isAuthenticated && r.isAuthenticated()))
        return res.status(401).json({ message: 'User not authenticated' });
    try {
        const found = await User_1.default.findById(r.user._id);
        if (!found)
            return res.status(404).json({ message: 'User not found' });
        const { profile } = req.body;
        if (profile) {
            found.profile.firstName = profile.firstName ?? found.profile.firstName;
            found.profile.lastName = profile.lastName ?? found.profile.lastName;
            found.profile.phone = profile.phone ?? found.profile.phone;
            if (profile.dateOfBirth)
                found.profile.dateOfBirth = new Date(profile.dateOfBirth);
        }
        else {
            found.profile.firstName = req.body.firstName ?? found.profile.firstName;
            found.profile.lastName = req.body.lastName ?? found.profile.lastName;
            found.profile.phone = req.body.phone ?? found.profile.phone;
            if (req.body.dateOfBirth)
                found.profile.dateOfBirth = new Date(req.body.dateOfBirth);
        }
        await found.save();
        const userObj = found.toObject();
        delete userObj.password;
        return res.status(200).json({ message: 'Profile updated', user: userObj });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error updating profile' });
    }
});
/**
 * Delete user
 * Accessible to: authenticated users
 */
router.delete('/delete-user', auth_1.ensureAuthenticated, async (req, res) => {
    const r = req;
    if (!(r.isAuthenticated && r.isAuthenticated()))
        return res.status(401).json({ message: 'User not authenticated' });
    try {
        const deleted = await User_1.default.findByIdAndDelete(r.user._id);
        if (!deleted)
            return res.status(404).json({ message: 'User not found' });
        r.session?.destroy((err) => {
            if (err)
                return res.status(500).json({ message: 'Error deleting session' });
            r.logout(() => {
                return res.status(200).json({ message: 'User deleted and logged out successfully' });
            });
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error deleting user' });
    }
});
exports.default = router;
