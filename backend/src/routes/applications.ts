import { Router, Request, Response } from "express";
import Application from "../models/Application";

const router = Router();

// POST /api/applications/new - Create a new application
// Accessible to: logged in users
router.post("/new", async (req: Request, res: Response) => {
  try {
    const applicationData = {
      ...req.body,
      applicationType: "new",
      status: "submitted",
      submittedAt: new Date(),
    };

    const application = new Application(applicationData);
    await application.save();

    res.status(201).json({
      success: true,
      message: "New application submitted successfully",
      applicationId: application._id,
      application,
    });
  } catch (error: any) {
    console.error("Error creating new application:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
});

// POST /api/applications/renewal - Create a renewal application
// Accessible to: logged in users
router.post("/renewal", async (req: Request, res: Response) => {
  try {
    const applicationData = {
      ...req.body,
      applicationType: "renewal",
      status: "submitted",
      submittedAt: new Date(),
    };

    const application = new Application(applicationData);
    await application.save();

    res.status(201).json({
      success: true,
      message: "Renewal application submitted successfully",
      applicationId: application._id,
      application,
    });
  } catch (error: any) {
    console.error("Error creating renewal application:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit renewal application",
      error: error.message,
    });
  }
});

// GET /api/applications - Get all applications (with filters)
// Accessible to: admin only
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      applicationType,
      status,
      academicYear,
      limit = 50,
      skip = 0,
    } = req.query;

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (applicationType) filter.applicationType = applicationType;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("userId", "email profile")
      .populate("reviewedBy", "email profile");

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      applications,
      total,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

// GET /api/applications/:id - Get a specific application
// Accessible to: owner or admin
// NOTE:  middleware expects the owner id to be in req.params.userId, req.body.userId, req.query.userId
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("userId", "email profile")
      .populate("reviewedBy", "email profile")
      .populate("adminNotes.createdBy", "email profile");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error: any) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
      error: error.message,
    });
  }
});

// PATCH /api/applications/:id/status - Update application status (admin only)
// Accessible to: admin only
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status, reviewedBy } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedBy,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application status updated",
      application,
    });
  } catch (error: any) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
});

// POST /api/applications/:id/notes - Add admin note to application
// Accessible to: admin only
router.post("/:id/notes", async (req: Request, res: Response) => {
  try {
    const { note, createdBy } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          adminNotes: {
            note,
            createdBy,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Note added successfully",
      application,
    });
  } catch (error: any) {
    console.error("Error adding note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message,
    });
  }
});

// DELETE /api/applications/:id/notes/:noteId - Delete admin note from application
// Accessible to: admin only
router.delete("/:id/notes/:noteId", async (req: Request, res: Response) => {
  try {
    const { id, noteId } = req.params;

    const application = await Application.findOneAndUpdate(
      { _id: id, "adminNotes._id": noteId },
      {
        $pull: {
          adminNotes: { _id: noteId },
        },
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application or note not found",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
      application,
    });
  } catch (error: any) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
});

export default router;
