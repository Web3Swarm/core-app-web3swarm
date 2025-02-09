import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { NgrokService } from "./services/ngrok.service.js";
import { TelegramService } from "./services/telegram.service.js";
import { IService } from "./services/base.service.js";
import twitterRouter from "./routes/twitter.js";
import discordRouter from "./routes/discord.js";
import cookieParser from "cookie-parser";
import githubRouter from "./routes/github.js";
import { AnyType } from "./utils.js";
import { isHttpError } from "http-errors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";
import { connectDB, disconnectDB } from "./config/database.js";
import { seedSwarms } from "./seed/swarms.js";
import type { Agent } from "./types.js";
import type { Document } from "mongoose";

// Import routes
import agentsRouter from "./routes/agents.js";
import swarmsRouter from "./routes/swarms.js";
import chatRouter from "./routes/chat.js";
import messagesRouter from "./routes/messages.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import stylusRouter from "./routes/stylus.js";

// Convert ESM module URL to filesystem path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Track services for graceful shutdown
const services: IService[] = [];

// Load environment variables from root .env file
dotenv.config({
  path: resolve(__dirname, "../../.env"),
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Configure CORS with specific allowed origins
const allowedOrigins = [
  "http://localhost:3000", // Next.js development server
  "http://localhost:3001", // Express development server
  process.env.NEXT_PUBLIC_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/agents", agentsRouter);
app.use("/api/swarms", swarmsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/users", usersRouter);
app.use("/api/users", authRouter);
app.use("/api/project", stylusRouter);

// Initialize Telegram bot service
const telegramService = TelegramService.getInstance();

// Mount Telegram webhook endpoint
app.use("/telegram/webhook", telegramService.getWebhookCallback());

// Mount Twitter OAuth routes
app.use("/auth/twitter", twitterRouter);

// Mount Discord OAuth routes
app.use("/auth/discord", discordRouter);

// Mount GitHub OAuth routes
app.use("/auth/github", githubRouter);

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// 404 handler
app.use((_req: Request, _res: Response, _next: NextFunction) => {
  _res.status(404).json({
    message: `Route ${_req.method} ${_req.url} not found`,
  });
});

app.use((_err: AnyType, _req: Request, _res: Response, _next: NextFunction) => {
  if (isHttpError(_err)) {
    _res.status(_err.statusCode).json({
      message: _err.message,
    });
  } else if (_err instanceof Error) {
    _res.status(500).json({
      message: `Internal Server Error: ${_err.message}`,
    });
  } else {
    _res.status(500).json({
      message: `Internal Server Error`,
    });
  }
});

interface PopulatedSwarm extends Document {
  agents: Agent[];
}

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connected successfully");

    // Seed default data
    try {
      const stylusSwarm = await seedSwarms();
      console.log("Default agents and swarms seeded successfully");
      if (stylusSwarm?.agents?.length) {
        const populatedSwarm = await stylusSwarm.populate('agents') as PopulatedSwarm;
        console.log("Stylus Swarm created with agents:", 
          populatedSwarm.agents.map(agent => agent.name)
        );
      }
    } catch (error) {
      console.error("Error seeding data:", error);
    }

    // Start server
    const server = app.listen(port, () => {
      console.log(`Server running on PORT: ${port}`);
      console.log(`Server Environment: ${process.env.NODE_ENV}`);
    });

    // Start ngrok tunnel for development
    const ngrokService = NgrokService.getInstance();
    await ngrokService.start();
    services.push(ngrokService);

    const ngrokUrl = ngrokService.getUrl()!;
    console.log("NGROK URL:", ngrokUrl);

    // Initialize services
    try {
      await telegramService.start();
      await telegramService.setWebhook(ngrokUrl);
      services.push(telegramService);
      console.log("Telegram service started successfully");
    } catch (error) {
      console.warn("Failed to start Telegram service:", error.message);
      console.log(
        "Server will continue running without Telegram functionality"
      );
    }

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  await Promise.all([
    ...services.map((service) => service.stop()),
    disconnectDB(),
  ]);
  process.exit(0);
}

// Register shutdown handlers
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
