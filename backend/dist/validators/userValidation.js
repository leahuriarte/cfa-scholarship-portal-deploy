"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeEmailValidation = exports.changePasswordValidation = exports.updateUserValidation = exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
const requireNameEitherTopLevelOrProfile = (0, express_validator_1.body)().custom((_, { req }) => {
    const hasProfile = req.body.profile && typeof req.body.profile === 'object';
    const topFirst = req.body.firstName;
    const topLast = req.body.lastName;
    if (hasProfile) {
        if (!req.body.profile.firstName || !req.body.profile.lastName) {
            throw new Error('If profile is provided it must include firstName and lastName');
        }
        return true;
    }
    if (!topFirst || !topLast) {
        throw new Error('Either profile (with firstName and lastName) or top-level firstName and lastName must be provided');
    }
    return true;
});
const passwordValidators = () => [
    (0, express_validator_1.body)('password')
        .exists().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8, max: 32 }).withMessage('Password must be between 8 and 32 characters')
        .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must include a number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must include a special character'),
];
exports.createUserValidation = [
    requireNameEitherTopLevelOrProfile,
    (0, express_validator_1.body)('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address')
        .normalizeEmail(),
    ...passwordValidators(),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['student', 'admin']).withMessage('Role must be either "student" or "admin"'),
    // profile can be provided as nested object
    (0, express_validator_1.body)('profile').optional().isObject().withMessage('Profile must be an object'),
    (0, express_validator_1.body)('profile.firstName')
        .if((0, express_validator_1.body)('profile').exists())
        .exists().withMessage('First name is required in profile')
        .isString().withMessage('First name must be a string')
        .isLength({ min: 1 }).withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('profile.lastName')
        .if((0, express_validator_1.body)('profile').exists())
        .exists().withMessage('Last name is required in profile')
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    (0, express_validator_1.body)('profile.phone')
        .optional()
        .isString().withMessage('Phone must be a string')
        .isMobilePhone('any').withMessage('Phone must be a valid phone number'),
    (0, express_validator_1.body)('profile.dateOfBirth')
        .optional()
        .isISO8601().withMessage('dateOfBirth must be an ISO8601 date')
        .toDate(),
];
exports.updateUserValidation = [
    // For updates fields are optional
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail().withMessage('Email must be a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .optional()
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8, max: 32 }).withMessage('Password must be between 8 and 32 characters')
        .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
        .matches(/[0-9]/).withMessage('Password must include a number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must include a special character'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['student', 'admin']).withMessage('Role must be either "student" or "admin"'),
    (0, express_validator_1.body)('profile').optional().isObject().withMessage('Profile must be an object'),
    (0, express_validator_1.body)('profile.firstName')
        .optional()
        .isString().withMessage('First name must be a string')
        .isLength({ min: 1 }).withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('profile.lastName')
        .optional()
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 1 }).withMessage('Last name cannot be empty'),
    (0, express_validator_1.body)('profile.phone')
        .optional()
        .isString().withMessage('Phone must be a string')
        .isMobilePhone('any').withMessage('Phone must be a valid phone number'),
    (0, express_validator_1.body)('profile.dateOfBirth')
        .optional()
        .isISO8601().withMessage('dateOfBirth must be an ISO8601 date')
        .toDate(),
];
exports.changePasswordValidation = [
    ...passwordValidators()
];
exports.changeEmailValidation = [
    (0, express_validator_1.body)('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address')
        .normalizeEmail(),
];
exports.default = {
    createUserValidation: exports.createUserValidation,
    updateUserValidation: exports.updateUserValidation,
    changePasswordValidation: exports.changePasswordValidation,
    changeEmailValidation: exports.changeEmailValidation,
};
