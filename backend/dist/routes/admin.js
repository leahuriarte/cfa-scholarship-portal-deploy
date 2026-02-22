"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const userValidation_1 = require("../validators/userValidation");
const bcryptHash_1 = require("../utils/bcryptHash");
const router = (0, express_1.Router)();
// Middleware to protect admin routes
router.use(auth_1.ensureAuthenticated);
router.use(auth_1.requireAdmin);
// GET all users (admin only)
router.get('/users', async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password'); // Exclude password from results
        return res.status(200).json(users);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching users' });
    }
});
// GET user by ID (admin only)
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching user' });
    }
});
// CREATE a new user (admin only)
router.post('/users', userValidation_1.createUserValidation, async (req, res) => {
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
    try {
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }
        const newUser = new User_1.default({
            email,
            password: await (0, bcryptHash_1.hashPassword)(password),
            role: role ?? 'applicant', // Default role for admin-created users
            profile: profileData,
        });
        await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;
        return res.status(201).json({ message: 'User created successfully', user: userObj });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error creating user' });
    }
});
// UPDATE user by ID (admin only)
router.put('/users/:id', userValidation_1.updateUserValidation, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    try {
        const { role, profile } = req.body;
        const updateFields = { role };
        if (profile) {
            updateFields.profile = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            };
        }
        else {
            // Allow updating top-level profile fields directly as well
            if (req.body.firstName)
                updateFields['profile.firstName'] = req.body.firstName;
            if (req.body.lastName)
                updateFields['profile.lastName'] = req.body.lastName;
            if (req.body.phone)
                updateFields['profile.phone'] = req.body.phone;
            if (req.body.dateOfBirth)
                updateFields['profile.dateOfBirth'] = new Date(req.body.dateOfBirth);
        }
        const updatedUser = await User_1.default.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error updating user' });
    }
});
// DELETE user by ID (admin only)
router.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error deleting user' });
    }
});
exports.default = router;
