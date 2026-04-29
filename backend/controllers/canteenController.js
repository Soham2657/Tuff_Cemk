import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import generateOrderToken from "../utils/generateOrderToken.js";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/Notifications.js";

const fetchApi =
  globalThis.fetch?.bind(globalThis) ||
  ((...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args)));

const defaultPrepWeight = 5;

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "canteen" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });


//  Add Menu Item (Admin)
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, prepWeight, category } = req.body;
    let imageUrl = "";

    const parsedPrepWeight = Number(prepWeight);
    const finalPrepWeight = Number.isFinite(parsedPrepWeight)
      ? parsedPrepWeight
      : defaultPrepWeight;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const item = await MenuItem.create({
      name,
      price,
      prepWeight: finalPrepWeight,
      image: imageUrl,
      category: category || "snacks",
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get Menu (with optional category filter)
export const getMenu = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const menu = await MenuItem.find(query);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH MENU
export const searchMenu = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const items = await MenuItem.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Place Order
export const placeOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    let totalPrice = 0;
    let totalPrepweight = 0;

    // Calculate total
    for (let item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) {
    return res.status(404).json({ message: "Menu item not found" });
  }
  if (!menuItem.available) {
    return res.status(400).json({ message: "Item not available" });
  }

      const quantity = Number(item.quantity) || 0;
      const prepWeightPerDish =
        Number.isFinite(Number(menuItem.prepWeight))
          ? Number(menuItem.prepWeight)
          : defaultPrepWeight;

      totalPrice += menuItem.price * quantity;
      totalPrepweight += prepWeightPerDish * quantity;
    }

    const hour = new Date().getHours();
    let timeOfDay = 0;
    if (hour >= 12 && hour < 14) {
      timeOfDay = 1;
    } else if (hour >= 14 && hour < 17) {
      timeOfDay = 3;
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalPrice,
      totalPrepweight,
      timeOfDay,
      tokenNumber: generateOrderToken(),
    });

    // Create a notification for the user
    const notification = new Notification({
      user: req.user._id,
      message: `Your order #${order.tokenNumber} has been placed successfully.`,
    });
    await notification.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.menuItem");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required" });
    }

    const statusMap = {
      preparing: "Preparing",
      ready: "Ready",
    };
    const normalizedStatus = statusMap[status.trim().toLowerCase()];

    if (!normalizedStatus) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'Preparing' or 'Ready'." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (normalizedStatus === "Ready" && order.status !== "Ready") {
      await Notification.create({
        user: order.user,
        message: "Your order is ready",
      });
    }
    order.status = normalizedStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getQueueInfo = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const currentOrder = await Order.findById(orderId);

    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const items = currentOrder.items || [];
    const totalQuantity = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) || 1;

    if (currentOrder.status === "Ready") {
      return res.json({
        ordersAhead: 0,
        estimatedTime: "0 minutes",
        totalQuantity,
      });
    }

    const ordersAhead = await Order.countDocuments({
      status: "Preparing",
      createdAt: { $lt: currentOrder.createdAt },
      _id: { $ne: currentOrder._id },
    });

    const hour = new Date().getHours();
    let timeOfDay = 0;
    if (hour >= 12 && hour < 14) {
      timeOfDay = 1;
    } else if (hour >= 14 && hour < 17) {
      timeOfDay = 3;
    }

    const totalPrepWeight = Number(currentOrder.totalPrepweight) || 0;
    const dayOfWeek = new Date().getDay();

    // Base time for this order: ~3 minutes per item (absolute minimum 1 minute)
    const avgTimePerItem = 3;
    const baseTimeForCurrentOrder = Math.max(1, totalQuantity * avgTimePerItem);
    let estimatedTime = baseTimeForCurrentOrder; // Start with at least the base time

    try {
      const response = await fetchApi("https://tuff-cemk.onrender.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalPrepWeight,
          totalQuantity,
          queueLength: ordersAhead,
          timeOfDay,
          dayOfWeek,
        }),
      });

      const data = await response.json();
      const predicted = Number(data.predicted_time);
      if (predicted > baseTimeForCurrentOrder) {
        estimatedTime = predicted;
      }
    } catch (mlError) {
      // Fallback: queue orders (3 min each) + current order prep time
      const queueWaitTime = ordersAhead * avgTimePerItem;
      estimatedTime = baseTimeForCurrentOrder + queueWaitTime;
    }

    // Final safety check: always at least the base time for current order
    if (estimatedTime < baseTimeForCurrentOrder) {
      estimatedTime = baseTimeForCurrentOrder;
    }

    res.json({
      ordersAhead,
      estimatedTime: `${Math.round(estimatedTime)} minutes`,
      totalQuantity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.menuItem")
      .sort({ createdAt: 1 }); // oldest first (queue order)

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};