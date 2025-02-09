import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { NgrokService } from "../services/ngrok.service.js";

/**
 * @swagger
 * tags:
 *   name: GitHub
 *   description: GitHub authentication and integration endpoints
 */

const router = Router();
const states = new Set<string>();

/**
 * @swagger
 * /auth/github/init:
 *   post:
 *     summary: Initialize GitHub OAuth flow
 *     description: Generates state for CSRF protection and creates GitHub authorization URL
 *     tags: [GitHub]
 *     responses:
 *       200:
 *         description: Authorization URL for GitHub OAuth
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   description: URL to redirect user for GitHub authorization
 *       500:
 *         description: Error initializing authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/init", async (_req: Request, res: Response) => {
  try {
    const ngrokURL = await NgrokService.getInstance().getUrl();
    const state = crypto.randomBytes(16).toString("hex");
    states.add(state);

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
    authUrl.searchParams.set(
      "redirect_uri",
      `${ngrokURL}/auth/github/callback`
    );
    authUrl.searchParams.set("scope", "read:user user:email");
    authUrl.searchParams.set("state", state);

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("[GitHub Auth] Error:", error);
    res.status(500).json({ error: "Auth initialization failed" });
  }
});

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: Handle OAuth callback from GitHub
 *     description: Exchanges authorization code for access token and fetches user profile
 *     tags: [GitHub]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 profile:
 *                   type: object
 *       400:
 *         description: Invalid state parameter
 *       500:
 *         description: Error processing callback
 */
router.get("/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const ngrokURL = await NgrokService.getInstance().getUrl();

    if (!states.has(state as string)) {
      res.status(400).json({ error: "Invalid state parameter" });
      return;
    }

    states.delete(state as string);

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${ngrokURL}/auth/github/callback`,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json({
      success: true,
      message: "GitHub authentication successful",
      token: accessToken,
      profile: userResponse.data,
    });
  } catch (error) {
    console.error("[GitHub Callback] Error:", error);
    res.status(500).json({ error: "Failed to process GitHub callback" });
  }
});

router.get("/success", async (req: Request, res: Response) => {
  try {
    const { github_token } = req.query;

    if (!github_token) {
      throw new Error("No token provided");
    }

    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${github_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json({
      success: true,
      message: "GitHub authentication successful",
      token: github_token,
      profile: profileResponse.data,
    });
  } catch (error) {
    console.error("[GitHub Success] Error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch profile information",
    });
  }
});

export default router;
