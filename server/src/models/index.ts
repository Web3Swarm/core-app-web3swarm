import mongoose from "mongoose";

// Agent Schema
const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: [
        "development",
        "research",
        "security",
        "defi",
        "nft",
        "dao",
        "gaming",
        "social",
        "analytics",
        "deployment",
        "community",
        "web3",
        "productivity",
        "data"
      ]
    },
    provider: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    capabilities: [{ type: String }],
    specialization: {
      type: String,
      enum: ["stylus", "solidity", "general", "wasm", "rust"],
      default: "general"
    },
    frameworks: [{ type: String }],
    languages: [{ type: String }],
  },
  { timestamps: true }
);

// Swarm Schema
const swarmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "🤖" },
    category: { 
      type: String, 
      required: true,
      enum: [
        "development", 
        "research", 
        "security", 
        "defi",
        "nft",
        "dao",
        "gaming",
        "social",
        "analytics",
        "deployment",
        "community"
      ]
    },
    capabilities: [{ type: String }],
    agents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Agent" }],
    tasks: [{ type: String }],
    platform: {
      type: String,
      enum: ["arbitrum", "base", "ethereum", "general"],
      default: "general"
    },
    primaryLanguage: {
      type: String,
      enum: ["rust", "solidity", "general"],
      default: "general"
    },
    frameworks: [{ type: String }],
  },
  { timestamps: true }
);

// Conversation Schema
const conversationSchema = new mongoose.Schema(
  {
    swarmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swarm",
      required: true,
    },
    title: { type: String, required: true },
    lastMessage: { type: String },
  },
  { timestamps: true }
);

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { 
      type: String, 
      enum: ["user", "assistant"], 
      required: true 
    },
    swarmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swarm",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  },
  { timestamps: true }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    avatar: String,
    walletAddress: { type: String, unique: true, sparse: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Export models
export const Agent = mongoose.model("Agent", agentSchema);
export const Swarm = mongoose.model("Swarm", swarmSchema);
export const Message = mongoose.model("Message", messageSchema);
export const Conversation = mongoose.model("Conversation", conversationSchema);
export const User = mongoose.model("User", userSchema);
