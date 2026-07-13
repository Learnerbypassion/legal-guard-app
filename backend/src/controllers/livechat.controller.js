const mongoose = require("mongoose");
const Message = require("../models/message.model");
const User = require("../models/user.model");

/**
 * Get paginated chat history between authenticated user and a recipient
 * GET /api/livechat/history/:recipientId?page=1&limit=50
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { recipientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ success: false, error: "Invalid recipient ID" });
    }

    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) {
      return res.status(404).json({ success: false, error: "Recipient not found" });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId },
        { senderId: recipientId, recipientId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({
      $or: [
        { senderId: userId, recipientId },
        { senderId: recipientId, recipientId: userId },
      ],
    });

    return res.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch chat history" });
  }
};

/**
 * Get all conversations for the authenticated user
 * GET /api/livechat/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // Aggregate to find unique conversation partners with last message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $addFields: {
          partnerId: {
            $cond: {
              if: { $eq: ["$senderId", userId] },
              then: "$recipientId",
              else: "$senderId",
            },
          },
        },
      },
      {
        $group: {
          _id: "$partnerId",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipientId", userId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { lastMessageAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "partner",
        },
      },
      {
        $unwind: "$partner",
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCount: 1,
          "partner._id": 1,
          "partner.name": 1,
          "partner.email": 1,
          "partner.role": 1,
          "partner.professionalDetails": 1,
        },
      },
    ]);

    return res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch conversations" });
  }
};

module.exports = { getChatHistory, getConversations };
