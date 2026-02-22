"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const s3Upload_1 = require("../utils/s3Upload");
const File_1 = __importDefault(require("../models/File"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Configure multer to store files in memory (we'll upload directly to S3)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
/**
 * POST /api/files/upload
 * Upload a file to S3 and save metadata to database
 *
 * Body (multipart/form-data):
 * - file: The file to upload
 * - userId: User ID who is uploading
 * - relatedEntityType: Type of entity (application, midYearReport, paymentRequest)
 * - relatedEntityId: ID of the related entity
 * - documentType: Type of document (e.g., "transcript", "resume", "receipt")
 */
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Extract metadata from request body
        const { userId, relatedEntityType, relatedEntityId, documentType } = req.body;
        // Validate required fields
        if (!userId || !relatedEntityType || !relatedEntityId || !documentType) {
            return res.status(400).json({
                error: "Missing required fields: userId, relatedEntityType, relatedEntityId, documentType",
            });
        }
        // Validate entity type
        const validEntityTypes = ["application", "midYearReport", "paymentRequest"];
        if (!validEntityTypes.includes(relatedEntityType)) {
            return res.status(400).json({
                error: `Invalid relatedEntityType. Must be one of: ${validEntityTypes.join(", ")}`,
            });
        }
        // Validate the file
        const validation = (0, s3Upload_1.validateFile)(req.file);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }
        // Upload file to S3
        const s3Url = await (0, s3Upload_1.uploadFileToS3)(req.file.buffer, req.file.originalname, req.file.mimetype, relatedEntityType // Use entity type as folder name
        );
        // Save file metadata to database
        const fileRecord = new File_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            relatedEntityType,
            relatedEntityId: new mongoose_1.default.Types.ObjectId(relatedEntityId),
            fileMetadata: {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                storageUrl: s3Url,
                documentType,
            },
            uploadedAt: new Date(),
            isDeleted: false,
        });
        await fileRecord.save();
        // Return success response
        return res.status(201).json({
            message: "File uploaded successfully",
            file: {
                id: fileRecord._id,
                url: s3Url,
                originalName: req.file.originalname,
                size: req.file.size,
                documentType,
            },
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({
            error: "Failed to upload file",
            details: error.message || String(error)
        });
    }
});
/**
 * GET /api/files/:fileId
 * Get file metadata by ID
 * Accesible to: owner or admin
 */
router.get("/:fileId", (0, auth_1.requireOwnershipOrAdmin)('userId'), async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ error: "Invalid file ID" });
        }
        const file = await File_1.default.findOne({
            _id: fileId,
            isDeleted: false,
        });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        return res.json({
            id: file._id,
            url: file.fileMetadata.storageUrl,
            originalName: file.fileMetadata.originalName,
            mimeType: file.fileMetadata.mimeType,
            size: file.fileMetadata.size,
            documentType: file.fileMetadata.documentType,
            uploadedAt: file.uploadedAt,
        });
    }
    catch (error) {
        console.error("Error fetching file:", error);
        return res.status(500).json({ error: "Failed to fetch file" });
    }
});
/**
 * GET /api/files/entity/:entityType/:entityId
 * Get all files for a specific entity
 */
router.get("/entity/:entityType/:entityId", async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(entityId)) {
            return res.status(400).json({ error: "Invalid entity ID" });
        }
        const files = await File_1.default.find({
            relatedEntityType: entityType,
            relatedEntityId: entityId,
            isDeleted: false,
        }).sort({ uploadedAt: -1 });
        return res.json({
            files: files.map((file) => ({
                id: file._id,
                url: file.fileMetadata.storageUrl,
                originalName: file.fileMetadata.originalName,
                mimeType: file.fileMetadata.mimeType,
                size: file.fileMetadata.size,
                documentType: file.fileMetadata.documentType,
                uploadedAt: file.uploadedAt,
            })),
        });
    }
    catch (error) {
        console.error("Error fetching files:", error);
        return res.status(500).json({ error: "Failed to fetch files" });
    }
});
/**
 * DELETE /api/files/:fileId
 * Soft delete a file (marks as deleted but doesn't remove from S3)
 * To permanently delete from S3, include ?permanent=true
 * Accesible to: owner or admin
 */
router.delete("/:fileId", (0, auth_1.requireOwnershipOrAdmin)('userId'), async (req, res) => {
    try {
        const { fileId } = req.params;
        const { permanent } = req.query;
        if (!mongoose_1.default.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ error: "Invalid file ID" });
        }
        const file = await File_1.default.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        if (permanent === "true") {
            // Delete from S3
            await (0, s3Upload_1.deleteFileFromS3)(file.fileMetadata.storageUrl);
            // Delete from database
            await File_1.default.findByIdAndDelete(fileId);
            return res.json({ message: "File permanently deleted" });
        }
        else {
            // Soft delete
            file.isDeleted = true;
            file.deletedAt = new Date();
            await file.save();
            return res.json({ message: "File marked as deleted" });
        }
    }
    catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ error: "Failed to delete file" });
    }
});
exports.default = router;
