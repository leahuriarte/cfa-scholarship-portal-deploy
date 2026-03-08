import { Router, Request, Response } from "express";
import multer from "multer";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadFileToS3, deleteFileFromS3, validateFile } from "../utils/s3Upload";
import { s3Client, S3_BUCKET_NAME } from "../utils/s3Client";
import File from "../models/File";
import mongoose from "mongoose";
import { requireOwnershipOrAdmin, requireAdmin } from '../middleware/auth';

const router = Router();

// Configure multer to store files in memory (we'll upload directly to S3)
const upload = multer({
  storage: multer.memoryStorage(),
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
router.post("/upload", upload.single("file") as any, async (req: any, res: Response) => {
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
    const validation = validateFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Upload file to S3
    const s3Url = await uploadFileToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      relatedEntityType // Use entity type as folder name
    );

    // Save file metadata to database
    const fileRecord = new File({
      userId: new mongoose.Types.ObjectId(userId),
      relatedEntityType,
      relatedEntityId: new mongoose.Types.ObjectId(relatedEntityId),
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
  } catch (error: any) {
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
router.get("/:fileId", requireOwnershipOrAdmin('userId'), async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const file = await File.findOne({
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
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ error: "Failed to fetch file" });
  }
});

/**
 * GET /api/files/:fileId/presigned-url
 * Generate a short-lived presigned URL for viewing a file
 * Accessible to: owner or admin
 */
router.get("/:fileId/presigned-url", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const file = await File.findOne({ _id: fileId, isDeleted: false });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const url = new URL(file.fileMetadata.storageUrl);
    const key = url.pathname.substring(1);

    const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return res.json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

/**
 * GET /api/files/entity/:entityType/:entityId
 * Get all files for a specific entity
 */
router.get("/entity/:entityType/:entityId", async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      return res.status(400).json({ error: "Invalid entity ID" });
    }

    const files = await File.find({
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
  } catch (error) {
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
router.delete("/:fileId", requireOwnershipOrAdmin('userId'), async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { permanent } = req.query;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (permanent === "true") {
      // Delete from S3
      await deleteFileFromS3(file.fileMetadata.storageUrl);
      // Delete from database
      await File.findByIdAndDelete(fileId);
      return res.json({ message: "File permanently deleted" });
    } else {
      // Soft delete
      file.isDeleted = true;
      file.deletedAt = new Date();
      await file.save();
      return res.json({ message: "File marked as deleted" });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
