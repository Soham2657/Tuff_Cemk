import express from "express";
import {
  addMenuItem,
  getMenu,
  searchMenu,
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  getQueueInfo,
  getAllOrders

} from "../controllers/canteenController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Menu
router.post("/menu", protect, adminOnly,  upload.single("image"), addMenuItem);
router.get("/menu/search/query", protect, searchMenu);
router.get("/menu", protect, getMenu);

// Orders
router.post("/order", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);

//admin status update
router.put( "/order/:id",protect,adminOnly,updateOrderStatus);

//order estimation time
router.get("/queue/:id", protect, getQueueInfo);

// Get all orders (Admin)
router.get("/orders", protect, adminOnly, getAllOrders);
export default router;