import { Agent } from "../models/index.js";

export const seedAgents = async () => {
  try {
    // Clear existing agents
    await Agent.deleteMany({});

    // Stylus-specific agents
    const stylusAgents = [
      {
        name: "Stylus Development Agent",
        description: "Expert in Rust-based smart contract development using Arbitrum Stylus, specializing in WASM optimization and ERC standards implementation.",
        icon: "⚡",
        category: "development",
        provider: "Web3Swarm",
        isActive: true,
        specialization: "stylus",
        capabilities: [
          "Rust smart contract development",
          "WASM optimization",
          "ERC standards implementation",
          "Cross-contract interoperability",
          "Gas optimization"
        ],
        frameworks: ["Stylus", "cargo-stylus"],
        languages: ["Rust", "WASM"]
      },
      {
        name: "WASM Optimization Agent",
        description: "Specializes in optimizing WebAssembly compilation and execution for Stylus smart contracts, focusing on performance and gas efficiency.",
        icon: "🔧",
        category: "development",
        provider: "Web3Swarm",
        isActive: true,
        specialization: "wasm",
        capabilities: [
          "WASM compilation optimization",
          "Memory management",
          "Performance tuning",
          "Gas cost reduction",
          "Binary size optimization"
        ],
        frameworks: ["Stylus", "wasm-opt"],
        languages: ["Rust", "WASM", "C++"]
      },
      {
        name: "Rust Contract Testing Agent",
        description: "Focused on comprehensive testing of Rust-based Stylus smart contracts, including unit tests, integration tests, and security checks.",
        icon: "🧪",
        category: "development",
        provider: "Web3Swarm",
        isActive: true,
        specialization: "rust",
        capabilities: [
          "Unit testing",
          "Integration testing",
          "Security auditing",
          "Gas usage analysis",
          "Performance benchmarking"
        ],
        frameworks: ["cargo-test", "proptest", "criterion"],
        languages: ["Rust"]
      }
    ];

    // Insert Stylus agents
    await Agent.insertMany(stylusAgents);
    console.log("Stylus agents seeded successfully");

    // Return the created agents for reference
    return await Agent.find({ specialization: "stylus" });
  } catch (error) {
    console.error("Error seeding agents:", error);
    throw error;
  }
}; 