import { Router, RequestHandler, Request, Response } from "express";
import { ApiResponse, Agent as AgentType } from "../types.js";
import { Agent } from "../models/index.js";
import { Types, Document } from "mongoose";

const router = Router();

interface AgentParams {
  id: string;
}

interface AgentBody {
  name?: string;
  description?: string;
  icon?: string;
  category?: string;
  provider?: string;
  isActive?: boolean;
}

type EmptyObject = Record<string, never>;

interface AgentDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  category: string;
  provider: string;
  isActive: boolean;
}

// Convert Mongoose document to Agent type
const toAgentType = (doc: AgentDocument): AgentType => ({
  id: doc._id.toString(),
  name: doc.name,
  description: doc.description,
  icon: doc.icon,
  category: doc.category,
  provider: doc.provider,
  isActive: doc.isActive,
});

/**
 * @swagger
 * /api/agents:
 *   get:
 *     tags: [Agents]
 *     summary: Get all agents
 *     description: Retrieve a list of all agents
 *     responses:
 *       200:
 *         description: List of agents retrieved successfully
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
 *                     $ref: '#/components/schemas/Agent'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
const getAllAgents: RequestHandler<
  EmptyObject,
  ApiResponse<AgentType[]>
> = async (
  _req: Request<EmptyObject>,
  res: Response<ApiResponse<AgentType[]>>
): Promise<void> => {
  try {
    const agents = await Agent.find();
    res.json({ success: true, data: agents.map(toAgentType) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch agents' });
  }
};

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     tags: [Agents]
 *     summary: Get a specific agent
 *     description: Retrieve a specific agent by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent ID
 *     responses:
 *       200:
 *         description: Agent retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
const getAgentById: RequestHandler<
  AgentParams,
  ApiResponse<AgentType>
> = async (
  req: Request<AgentParams>,
  res: Response<ApiResponse<AgentType>>
): Promise<void> => {
  try {
    const agent = await Agent.findById(new Types.ObjectId(req.params.id));
    if (!agent) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }
    res.json({ success: true, data: toAgentType(agent) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch agent' });
  }
};

/**
 * @swagger
 * /api/agents:
 *   post:
 *     tags: [Agents]
 *     summary: Create a new agent
 *     description: Create a new agent with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *             required:
 *               - name
 *               - description
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       500:
 *         description: Server error
 */
const createAgent: RequestHandler<
  EmptyObject,
  ApiResponse<AgentType>,
  AgentBody
> = async (req, res, next): Promise<void> => {
  try {
    const { name, description, icon, category, provider } = req.body;
    const newAgent = new Agent({
      name,
      description,
      icon,
      category,
      provider,
      isActive: false,
    });

    await newAgent.save();

    res.status(201).json({
      success: true,
      data: toAgentType(newAgent),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     tags: [Agents]
 *     summary: Update an agent
 *     description: Update a specific agent by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
const updateAgent: RequestHandler<
  AgentParams,
  ApiResponse<AgentType>,
  AgentBody
> = async (req, res, next): Promise<void> => {
  try {
    const { name, description, icon, category, provider, isActive } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        icon,
        category,
        provider,
        isActive,
      },
      { new: true }
    );

    if (!agent) {
      res.status(404).json({
        success: false,
        error: "Agent not found",
      });
      return;
    }

    res.json({
      success: true,
      data: toAgentType(agent),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     tags: [Agents]
 *     summary: Delete an agent
 *     description: Delete a specific agent by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent ID
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
const deleteAgent: RequestHandler<AgentParams, ApiResponse<void>> = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);

    if (!agent) {
      res.status(404).json({
        success: false,
        error: "Agent not found",
      });
      return;
    }

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Mount routes
router.get("/", getAllAgents);
router.get("/:id", getAgentById);
router.post("/", createAgent);
router.put("/:id", updateAgent);
router.delete("/:id", deleteAgent);

export default router;
