import express from "express";
import {
  applyToClub,
  updateApplication,
  getApplications

} from "../controllers/applicationController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";

const router = express.Router();

//  Apply to a club (student)

router.post("/:clubId", protect, applyToClub);


//  Approve / Reject application (admin)

router.put("/:id", protect, adminOnly, updateApplication);

// Get all applications (admin)
router.get("/", protect, adminOnly, getApplications);
export default router;