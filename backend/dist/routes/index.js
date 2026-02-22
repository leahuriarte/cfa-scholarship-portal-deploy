"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applications_1 = __importDefault(require("./applications"));
const renewalChecklists_1 = __importDefault(require("./renewalChecklists"));
const reimbursements_1 = __importDefault(require("./reimbursements"));
const acceptanceForms_1 = __importDefault(require("./acceptanceForms"));
const files_1 = __importDefault(require("./files"));
const users_1 = __importDefault(require("./users"));
const admin_1 = __importDefault(require("./admin"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Mount routes
router.use("/api/applications", applications_1.default);
router.use("/api/renewal-checklists", renewalChecklists_1.default);
router.use("/api/reimbursements", reimbursements_1.default);
router.use("/api/acceptance-forms", acceptanceForms_1.default);
router.use("/api/files", auth_1.ensureAuthenticated, files_1.default);
router.use("/users", users_1.default);
router.use("/api/admin", admin_1.default);
exports.default = router;
