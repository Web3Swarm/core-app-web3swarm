import { Router } from "express";
import { Swarm } from "../models/index.js";
import { Types } from "mongoose";
import type { RequestHandler } from "express";

const router = Router();

interface SwarmParams {
  id: string;
}

interface SwarmBody {
  name: string;
  description: string;
  agents?: string[];
}

interface SwarmAgentParams {
  id: string;
  agentId: string;
}

type EmptyParams = Record<string, never>;

/**
 * @swagger
 * /api/swarms:
 *   get:
 *     tags: [Swarms]
 *     summary: Get all swarms
 *     description: Retrieve a list of all swarms with populated agent data
 *     responses:
 *       200:
 *         description: List of swarms retrieved successfully
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
 *                     $ref: '#/components/schemas/Swarm'
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
const getAllSwarms: RequestHandler = async (_req, res) => {
  try {
    const swarms = await Swarm.find()
      .populate({
        path: 'agents',
        select: 'name icon description isActive'
      });
    res.json({ success: true, data: swarms });
    return;
  } catch (error) {
    console.error('Error fetching swarms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch swarms' 
    });
    return;
  }
};

/**
 * @swagger
 * /api/swarms/{id}:
 *   get:
 *     tags: [Swarms]
 *     summary: Get a specific swarm
 *     description: Retrieve a specific swarm by its ID with populated agent data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *     responses:
 *       200:
 *         description: Swarm retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Swarm'
 *       404:
 *         description: Swarm not found
 *       500:
 *         description: Server error
 */
const getSwarmById: RequestHandler<SwarmParams> = async (req, res) => {
  try {
    const swarm = await Swarm.findById(req.params.id)
      .populate({
        path: 'agents',
        select: 'name icon description isActive'
      });
    
    if (!swarm) {
      res.status(404).json({ 
        success: false, 
        error: 'Swarm not found' 
      });
      return;
    }
    
    res.json({ success: true, data: swarm });
    return;
  } catch (error) {
    console.error('Error fetching swarm:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch swarm' 
    });
    return;
  }
};

/**
 * @swagger
 * /api/swarms:
 *   post:
 *     tags: [Swarms]
 *     summary: Create a new swarm
 *     description: Create a new swarm with the provided data
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
 *               agents:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - name
 *               - description
 *     responses:
 *       201:
 *         description: Swarm created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Swarm'
 *       500:
 *         description: Server error
 */
const createSwarm: RequestHandler<EmptyParams, unknown, SwarmBody> = async (
  req,
  res,
  next
) => {
  try {
    const { name, description, agents = [] } = req.body;
    const newSwarm = new Swarm({
      name,
      description,
      agents: agents.map((id) => new Types.ObjectId(id)),
    });
    await newSwarm.save();
    res.status(201).json({ success: true, data: newSwarm });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/swarms/{id}:
 *   put:
 *     tags: [Swarms]
 *     summary: Update a swarm
 *     description: Update a specific swarm by its ID
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               agents:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Swarm updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Swarm'
 *       404:
 *         description: Swarm not found
 *       500:
 *         description: Server error
 */
const updateSwarm: RequestHandler<SwarmParams, unknown, SwarmBody> = async (
  req,
  res,
  next
) => {
  try {
    const { name, description, agents } = req.body;
    const swarm = await Swarm.findByIdAndUpdate(
      new Types.ObjectId(req.params.id),
      {
        name,
        description,
        agents: agents?.map((id) => new Types.ObjectId(id)),
      },
      { new: true }
    ).populate("agents");

    if (!swarm) {
      res.status(404).json({ success: false, error: "Swarm not found" });
      return;
    }
    res.json({ success: true, data: swarm });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/swarms/{id}:
 *   delete:
 *     tags: [Swarms]
 *     summary: Delete a swarm
 *     description: Delete a specific swarm by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *     responses:
 *       200:
 *         description: Swarm deleted successfully
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
const deleteSwarm: RequestHandler<SwarmParams> = async (req, res, next) => {
  try {
    const swarm = await Swarm.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!swarm) {
      res.status(404).json({ success: false, error: "Swarm not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/swarms/{id}/agents:
 *   post:
 *     tags: [Swarms]
 *     summary: Add an agent to a swarm
 *     description: Add a specific agent to a swarm
 *     parameters:
 *       - in: path
 *         name: id
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
 *               agentId:
 *                 type: string
 *             required:
 *               - agentId
 *     responses:
 *       200:
 *         description: Agent added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Swarm'
 *       400:
 *         description: Agent already exists in swarm
 *       404:
 *         description: Swarm not found
 *       500:
 *         description: Server error
 */
const addAgentToSwarm: RequestHandler<
  SwarmParams,
  unknown,
  { agentId: string }
> = async (req, res, next) => {
  try {
    const swarm = await Swarm.findById(new Types.ObjectId(req.params.id));
    if (!swarm) {
      res.status(404).json({ success: false, error: "Swarm not found" });
      return;
    }

    const agentObjectId = new Types.ObjectId(req.body.agentId);
    if (swarm.agents.some((id) => id.equals(agentObjectId))) {
      res
        .status(400)
        .json({ success: false, error: "Agent already exists in swarm" });
      return;
    }

    swarm.agents.push(agentObjectId);
    await swarm.save();
    const updatedSwarm = await swarm.populate("agents");
    res.json({ success: true, data: updatedSwarm });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/swarms/{id}/agents/{agentId}:
 *   delete:
 *     tags: [Swarms]
 *     summary: Remove an agent from a swarm
 *     description: Remove a specific agent from a swarm
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The swarm ID
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent ID to remove
 *     responses:
 *       200:
 *         description: Agent removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Swarm'
 *       404:
 *         description: Swarm or agent not found
 *       500:
 *         description: Server error
 */
const removeAgentFromSwarm: RequestHandler<SwarmAgentParams> = async (
  req,
  res,
  next
) => {
  try {
    const swarm = await Swarm.findById(new Types.ObjectId(req.params.id));
    if (!swarm) {
      res.status(404).json({ success: false, error: "Swarm not found" });
      return;
    }

    const agentObjectId = new Types.ObjectId(req.params.agentId);
    const agentIndex = swarm.agents.findIndex((id) => id.equals(agentObjectId));
    if (agentIndex === -1) {
      res
        .status(404)
        .json({ success: false, error: "Agent not found in swarm" });
      return;
    }

    swarm.agents.splice(agentIndex, 1);
    await swarm.save();
    const updatedSwarm = await swarm.populate("agents");
    res.json({ success: true, data: updatedSwarm });
  } catch (error) {
    next(error);
  }
};

// Mount routes with explicit type assertions
router.get("/", getAllSwarms as RequestHandler);
router.get("/:id", getSwarmById as RequestHandler<SwarmParams>);
router.post(
  "/",
  createSwarm as RequestHandler<EmptyParams, unknown, SwarmBody>
);
router.put(
  "/:id",
  updateSwarm as RequestHandler<SwarmParams, unknown, SwarmBody>
);
router.delete("/:id", deleteSwarm as RequestHandler<SwarmParams>);
router.post(
  "/:id/agents",
  addAgentToSwarm as RequestHandler<SwarmParams, unknown, { agentId: string }>
);
router.delete(
  "/:id/agents/:agentId",
  removeAgentFromSwarm as RequestHandler<SwarmAgentParams>
);

export default router;
