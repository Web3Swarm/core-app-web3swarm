import { Router, RequestHandler } from "express";
import { User } from "../models/index.js";

const router = Router();

interface AuthBody {
  address: string;
  signature?: string;  // Made optional since we're not using it now
  message?: string;    // Made optional since we're not using it now
}

interface AuthResponse {
  success: boolean;
  data?: {
    id: string;
    walletAddress: string;
    name: string | null;
    createdAt: Date;
    lastLogin?: Date;
  };
  error?: string;
}

// POST /api/users/auth - Authenticate or create user with wallet
const authenticateUser: RequestHandler<
  Record<string, never>,
  AuthResponse,
  AuthBody
> = async (req, res): Promise<void> => {
  try {
    const { address } = req.body;  // Only destructure what we need

    if (!address) {
      res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
      return;
    }

    // Normalize addresses to lowercase for comparison
    const normalizedAddress = address.toLowerCase();

    console.log('Auth request received:', {
      address: normalizedAddress
    });

    // Find or create user
    let user = await User.findOne({ 
      walletAddress: normalizedAddress 
    });

    if (!user) {
      console.log('Creating new user for address:', normalizedAddress);
      user = new User({
        walletAddress: normalizedAddress,
        name: `User_${normalizedAddress.slice(2, 8)}`,
        email: null,
      });
      await user.save();
      console.log('New user created:', user._id.toString());
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('User authenticated successfully:', {
      userId: user._id.toString(),
      address: normalizedAddress
    });

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        walletAddress: user.walletAddress || normalizedAddress,
        name: user.name || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
    return;
  } catch (error) {
    console.error('Authentication error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    });
    return;
  }
};

// Mount routes
router.post("/auth", authenticateUser);

export default router; 