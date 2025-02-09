import { Router } from "express";
import { Message, Swarm, Conversation } from "../models/index.js";
import { AIService } from "../services/ai.service.js";
import type { RequestHandler } from "express";
import { Types } from "mongoose";

const router = Router();
const aiService = AIService.getInstance();

interface MessageParams {
  swarmId: string;
  conversationId?: string;
  agentId?: string;
}

interface MessageBody {
  content: string;
  model: string;
  conversationId?: string;
}

/**
 * @swagger
 * /api/messages/{swarmId}/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get conversations
 *     description: Get all conversations for a specific swarm
 *     parameters:
 *       - in: path
 *         name: swarmId
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
const getConversations: RequestHandler<MessageParams> = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ swarmId: req.params.swarmId })
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/{swarmId}/conversations/{conversationId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get chat messages
 *     description: Get all messages for a specific conversation
 */
const getMessages: RequestHandler<MessageParams> = async (req, res, next) => {
  try {
    const messages = await Message.find({ 
      swarmId: req.params.swarmId,
      conversationId: req.params.conversationId 
    }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/messages/{swarmId}:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message
 *     description: Send a message to a swarm and get AI responses
 */
const sendMessage: RequestHandler<MessageParams, unknown, MessageBody> = async (
  req,
  res,
  next
) => {
  try {
    const { content, model, conversationId } = req.body;
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

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        res.status(404).json({
          success: false,
          error: "Conversation not found"
        });
        return;
      }
    } else {
      // Create new conversation with first few words as title
      const title = content.split(' ').slice(0, 5).join(' ') + '...';
      conversation = new Conversation({
        swarmId,
        title,
        lastMessage: content
      });
      await conversation.save();
    }

    // Save user message
    const userMessage = new Message({
      content,
      sender: "user",
      swarmId,
      conversationId: conversation._id
    });
    await userMessage.save();

    try {
      // Get AI response based on swarm category
      const aiResponse = await aiService.getSwarmResponse(
        content,
        String(swarm.category),
        model
      );

      // Save AI response
      const assistantMessage = new Message({
        content: aiResponse.assistantMessage.content,
        sender: "assistant",
        swarmId,
        conversationId: conversation._id
      });
      await assistantMessage.save();

      // Update conversation's last message
      conversation.lastMessage = assistantMessage.content;
      await conversation.save();

      // Return both messages and conversation
      res.status(201).json({
        success: true,
        data: {
          conversation: {
            id: conversation._id.toString(),
            title: conversation.title,
            lastMessage: conversation.lastMessage,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
          },
          userMessage: {
            id: userMessage._id.toString(),
            content: userMessage.content,
            role: "user",
            timestamp: userMessage.createdAt,
            swarmId: userMessage.swarmId.toString(),
            conversationId: conversation._id.toString()
          },
          assistantMessage: {
            id: assistantMessage._id.toString(),
            content: assistantMessage.content,
            role: "assistant",
            timestamp: assistantMessage.createdAt,
            swarmId: assistantMessage.swarmId.toString(),
            conversationId: conversation._id.toString()
          },
        },
      });
    } catch (error) {
      console.error("AI Service Error:", error);
      // Return detailed error message
      res.status(500).json({
        success: false,
        data: {
          conversation: {
            id: conversation._id.toString(),
            title: conversation.title,
            lastMessage: conversation.lastMessage,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
          },
          userMessage: {
            id: userMessage._id.toString(),
            content: userMessage.content,
            role: "user",
            timestamp: userMessage.createdAt,
            swarmId: userMessage.swarmId.toString(),
            conversationId: conversation._id.toString()
          }
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
 * /api/messages/{swarmId}/conversations/{conversationId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a conversation
 *     description: Delete a specific conversation and its messages
 */
const deleteConversation: RequestHandler<MessageParams> = async (req, res, next) => {
  try {
    const { swarmId, conversationId } = req.params;
    await Message.deleteMany({ swarmId, conversationId });
    await Conversation.findByIdAndDelete(conversationId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Mount routes
router.get("/:swarmId/conversations", getConversations);
router.get("/:swarmId/conversations/:conversationId", getMessages);
router.post("/:swarmId", sendMessage);
router.delete("/:swarmId/conversations/:conversationId", deleteConversation);

export default router; 