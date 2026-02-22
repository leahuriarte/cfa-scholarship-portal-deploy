"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RenewalChecklist_1 = __importDefault(require("../models/RenewalChecklist"));
const router = (0, express_1.Router)();
// POST /api/renewal-checklists - Create a new renewal checklist
router.post("/", async (req, res) => {
    try {
        const checklistData = {
            ...req.body,
            status: "submitted",
            submittedAt: new Date(),
        };
        const checklist = new RenewalChecklist_1.default(checklistData);
        await checklist.save();
        res.status(201).json({
            success: true,
            message: "Renewal checklist submitted successfully",
            checklistId: checklist._id,
            checklist,
        });
    }
    catch (error) {
        console.error("Error creating renewal checklist:", error);
        res.status(400).json({
            success: false,
            message: "Failed to submit renewal checklist",
            error: error.message,
        });
    }
});
// GET /api/renewal-checklists - Get all renewal checklists (with filters)
// Accessible to: admin
router.get("/", async (req, res) => {
    try {
        const { userId, applicationId, academicYear, status, limit = 50, skip = 0, } = req.query;
        const filter = {};
        if (userId)
            filter.userId = userId;
        if (applicationId)
            filter.applicationId = applicationId;
        if (academicYear)
            filter.academicYear = academicYear;
        if (status)
            filter.status = status;
        const checklists = await RenewalChecklist_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip))
            .populate("userId", "email profile")
            .populate("applicationId")
            .populate("reviewedBy", "email profile");
        const total = await RenewalChecklist_1.default.countDocuments(filter);
        res.json({
            success: true,
            checklists,
            total,
            limit: Number(limit),
            skip: Number(skip),
        });
    }
    catch (error) {
        console.error("Error fetching renewal checklists:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch renewal checklists",
            error: error.message,
        });
    }
});
// GET /api/renewal-checklists/:id - Get a specific renewal checklist
// Accessible to: owner or admin
router.get("/:id", async (req, res) => {
    try {
        const checklist = await RenewalChecklist_1.default.findById(req.params.id)
            .populate("userId", "email profile")
            .populate("applicationId")
            .populate("reviewedBy", "email profile");
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: "Renewal checklist not found",
            });
        }
        res.json({
            success: true,
            checklist,
        });
    }
    catch (error) {
        console.error("Error fetching renewal checklist:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch renewal checklist",
            error: error.message,
        });
    }
});
// PATCH /api/renewal-checklists/:id/review - Review a renewal checklist (admin)
// Accessible to: admin only
router.patch("/:id/review", async (req, res) => {
    try {
        const { reviewedBy, adminNotes, status } = req.body;
        const checklist = await RenewalChecklist_1.default.findByIdAndUpdate(req.params.id, {
            status: status || "reviewed",
            reviewedBy,
            reviewedAt: new Date(),
            adminNotes,
        }, { new: true });
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: "Renewal checklist not found",
            });
        }
        res.json({
            success: true,
            message: "Renewal checklist reviewed",
            checklist,
        });
    }
    catch (error) {
        console.error("Error reviewing renewal checklist:", error);
        res.status(500).json({
            success: false,
            message: "Failed to review renewal checklist",
            error: error.message,
        });
    }
});
exports.default = router;
