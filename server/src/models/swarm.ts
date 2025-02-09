import { Schema, model } from "mongoose";

const swarmSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: "🤖",
  },
  color: {
    type: String,
    enum: ["purple", "blue", "green", "red", "yellow", "pink"],
    default: "blue",
  },
  agents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Agent",
    },
  ],
  tasks: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Swarm = model("Swarm", swarmSchema);
