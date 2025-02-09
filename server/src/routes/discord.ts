import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { NgrokService } from "../services/ngrok.service.js";

/**
 * @swagger
 * tags:
 *   name: Discord
 *   description: Discord authentication and integration endpoints
 */

const router = Router();
const states = new Set<string>();

/**
 * @swagger
 * /auth/discord/init:
 *   post:
 *     summary: Initialize Discord OAuth flow
 *     description: Generates state for CSRF protection and creates Discord authorization URL
 *     tags: [Discord]
 *     responses:
 *       200:
 *         description: Authorization URL for Discord OAuth
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   description: URL to redirect user for Discord authorization
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

    const authUrl = new URL("https://discord.com/api/oauth2/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
    authUrl.searchParams.set(
      "redirect_uri",
      `${ngrokURL}/auth/discord/callback`
    );
    authUrl.searchParams.set("scope", "identify email");
    authUrl.searchParams.set("state", state);

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("[Discord Auth] Error:", error);
    res.status(500).json({ error: "Auth initialization failed" });
  }
});

/**
 * @swagger
 * /auth/discord/callback:
 *   get:
 *     summary: Handle OAuth callback from Discord
 *     description: Exchanges authorization code for access token and fetches user profile
 *     tags: [Discord]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Discord
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
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: `${ngrokURL}/auth/discord/callback`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json({
      success: true,
      message: "Discord authentication successful",
      token: accessToken,
      profile: userResponse.data,
    });
  } catch (error) {
    console.error("[Discord Callback] Error:", error);
    res.status(500).json({ error: "Failed to process Discord callback" });
  }
});

router.get("/success", async (req: Request, res: Response) => {
  try {
    const { discord_token } = req.query;

    if (!discord_token) {
      throw new Error("No token provided");
    }

    const profileResponse = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${discord_token}`,
        },
      }
    );

    res.json({
      success: true,
      message: "Discord authentication successful",
      token: discord_token,
      profile: profileResponse.data,
    });
  } catch (error) {
    console.error("[Discord Success] Error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch profile information",
    });
  }
});

export default router;
