import { Router, Request, Response, NextFunction } from "express";

const router = Router();

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Test endpoint to verify server is running
 *     description: A simple hello world endpoint that only works in development mode
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Success response with hello message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World!"
 *       403:
 *         description: Forbidden - Only available in development mode
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 */

//middleware to check that NODE_ENV is only local development
const checkNodeEnv = (_req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};

//handles the collabland api token creation in .env
const handlePostCollabLand = async (_req: Request, res: Response) => {
  console.log("Getting AI Agent Starter Kit ...");
  res.status(200).json({
    message: "AI Agent Starter Kit",
    timestamp: new Date().toISOString(),
  });
};

router.get("/collabland", checkNodeEnv, handlePostCollabLand);

router.get("/", checkNodeEnv, (_req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

export default router;
