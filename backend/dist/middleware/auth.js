"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.ensureAuthenticated = void 0;
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Succeeds only if the request has an authenticated session (passport).
 * Returns 401 JSON if no authenticated user is present.
 */
const ensureAuthenticated = (req, res, next) => {
    const r = req;
    const isAuth = typeof r.isAuthenticated === 'function' ? r.isAuthenticated() : Boolean(r.user);
    if (isAuth)
        return next();
    return res.status(401).json({ error: 'Authentication required' });
};
exports.ensureAuthenticated = ensureAuthenticated;
/**
 * Succeeds only if the authenticated user has role === 'admin'.
 * If the user is not authenticated returns 401; if authenticated but not admin returns 403.
 */
const requireAdmin = (req, res, next) => {
    const r = req;
    const currentUser = r.user;
    if (!currentUser)
        return res.status(401).json({ error: 'Authentication required' });
    if (currentUser.role !== 'admin')
        return res.status(403).json({ error: 'Admin role required' });
    return next();
};
exports.requireAdmin = requireAdmin;
/**
 * Attempts to locate an owner id in this order:
 * 1) req.params[field]  2) req.body[field]  3) req.query[field]
 *
 * If the owner id is present and valid, the middleware checks:
 * - if current authenticated user's _id matches owner id
 * - if current authenticated user is admin
 * otherwise respond with 403.
 */
function requireOwnershipOrAdmin(field = 'userId') {
    return (req, res, next) => {
        const r = req;
        const currentUser = r.user;
        if (!currentUser)
            return res.status(401).json({ error: 'Authentication required' });
        const params = r.params ?? {};
        const body = r.body ?? {};
        const query = r.query ?? {};
        const rawOwnerId = (params[field] ?? body[field] ?? query[field]);
        if (rawOwnerId == null)
            return res.status(400).json({ error: `${field} is required for ownership check` });
        const ownerIdStr = String(rawOwnerId);
        if (!mongoose_1.default.Types.ObjectId.isValid(ownerIdStr)) {
            return res.status(400).json({ error: `${field} is not a valid ObjectId` });
        }
        const currentUserId = String(currentUser._id ?? currentUser.id ?? currentUser);
        if (currentUser.role === 'admin' || currentUserId === ownerIdStr)
            return next();
        return res.status(403).json({ error: 'Not authorized for this resource' });
    };
}
