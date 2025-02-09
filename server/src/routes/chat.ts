import { Router, RequestHandler } from "express";
import { Message, Swarm } from "../models/index.js";
import { Types } from "mongoose";
import { AIService } from "../services/ai.service.js";

const router = Router();
const aiService = AIService.getInstance();

interface MessageParams {
  swarmId: string;
  agentId?: string;
}

interface MessageBody {
  content: string;
  sender: "user" | "assistant";
  model: string;
  agentId?: string;
}

/**
 * @swagger
 * /api/chat/{swarmId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get chat messages
 *     description: Get all messages for a specific swarm
 *     parameters:
 *       - in: path
 *         name: swarmId
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       404:
 *         description: Swarm not found
 *       500:
 *         description: Server error
 */
const getMessages: RequestHandler<MessageParams> = async (req, res, next) => {
  try {
    const messages = await Message.find({ swarmId: req.params.swarmId })
      .sort({ timestamp: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/chat/{swarmId}/messages:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message
 *     description: Send a message to a swarm and get AI responses
 *     parameters:
 *       - in: path
 *         name: swarmId
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The message content to send
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: Message sent successfully and responses received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userMessage:
 *                       $ref: '#/components/schemas/Message'
 *                     assistantMessage:
 *                       $ref: '#/components/schemas/Message'
 *       404:
 *         description: Swarm not found
 *       500:
 *         description: Server error
 */
const sendMessage: RequestHandler<MessageParams, unknown, MessageBody> = async (
  req,
  res,
  next
) => {
  try {
    const { content, model } = req.body;
    const swarmId = new Types.ObjectId(req.params.swarmId);

    // Get swarm details for context
    const swarm = await Swarm.findById(swarmId).populate('agents');
    if (!swarm) {
      res.status(404).json({
        success: false,
        error: "Swarm not found"
      });
      return;
    }

    // Save user message
    const userMessage = new Message({
      content,
      sender: "user",
      swarmId,
    });
    await userMessage.save();

    try {
      // Get AI response based on swarm category and capabilities
      const aiResponse = await aiService.getSwarmResponse(
        content,
        swarm.category,
        model
      );

      // Save AI response
      const assistantMessage = new Message({
        content: aiResponse.assistantMessage.content,
        sender: "assistant",
        swarmId,
      });
      await assistantMessage.save();

      // Return both messages
      res.status(201).json({
        success: true,
        data: {
          userMessage: {
            id: userMessage._id.toString(),
            content: userMessage.content,
            role: "user",
            timestamp: userMessage.createdAt,
            swarmId: userMessage.swarmId.toString(),
          },
          assistantMessage: {
            id: assistantMessage._id.toString(),
            content: assistantMessage.content,
            role: "assistant",
            timestamp: assistantMessage.createdAt,
            swarmId: assistantMessage.swarmId.toString(),
          },
        },
      });
    } catch (error) {
      console.error("AI Service Error:", error);
      // Return detailed error message
      res.status(500).json({
        success: false,
        data: {
          userMessage: {
            id: userMessage._id.toString(),
            content: userMessage.content,
            role: "user",
            timestamp: userMessage.createdAt,
            swarmId: userMessage.swarmId.toString(),
          },
        },
        error: error instanceof Error ? error.message : "Failed to generate AI response"
      });
    }
  } catch (error) {
    console.error("Message Handler Error:", error);
    next(error instanceof Error ? error : new Error("Failed to process message"));
  }
};

/**
 * @swagger
 * /api/chat/{swarmId}/messages:
 *   delete:
 *     tags: [Chat]
 *     summary: Clear chat history
 *     description: Delete all messages for a specific swarm
 *     parameters:
 *       - in: path
 *         name: swarmId
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *     responses:
 *       200:
 *         description: Chat history cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Swarm not found
 *       500:
 *         description: Server error
 */
const clearHistory: RequestHandler<MessageParams> = async (req, res, next) => {
  try {
    await Message.deleteMany({ swarmId: req.params.swarmId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Mount routes
router.get("/:swarmId/messages", getMessages);
router.post("/:swarmId/messages", sendMessage);
router.delete("/:swarmId/messages", clearHistory);

export default router;
