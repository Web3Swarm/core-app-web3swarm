import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web3Swarm API Documentation",
      version: "1.0.0",
      description: "API documentation for Web3Swarm platform",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      contact: {
        name: "Web3Swarm Support",
        url: "https://web3swarm.xyz",
        email: "support@web3swarm.xyz",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Agent: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            icon: { type: "string" },
            category: { type: "string" },
            provider: { type: "string" },
            isActive: { type: "boolean" },
            capabilities: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["name", "description", "category", "provider"],
        },
        Swarm: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            icon: { type: "string" },
            category: {
              type: "string",
              enum: ["development", "research", "security", "defi", "nft", "dao", "gaming", "social", "analytics", "deployment", "community"],
            },
            capabilities: {
              type: "array",
              items: { type: "string" },
            },
            agents: {
              type: "array",
              items: { $ref: "#/components/schemas/Agent" },
            },
            tasks: {
              type: "array",
              items: { type: "string" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["name", "description", "category"],
        },
        Message: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string" },
            role: {
              type: "string",
              enum: ["user", "assistant"],
            },
            swarmId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
          required: ["content", "role", "swarmId"],
        },
        ChatResponse: {
          type: "object",
          properties: {
            userMessage: { $ref: "#/components/schemas/Message" },
            assistantMessage: { $ref: "#/components/schemas/Message" },
          },
          required: ["userMessage", "assistantMessage"],
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            avatar: { type: "string" },
            walletAddress: { type: "string" },
            lastLogin: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["name"],
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "object" },
            error: { type: "string" },
          },
          required: ["success"],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Agents", description: "Agent management endpoints" },
      { name: "Swarms", description: "Swarm management endpoints" },
      { name: "Chat", description: "Chat and messaging endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "Auth", description: "Authentication endpoints" },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
