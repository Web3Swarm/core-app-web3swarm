import { Swarm } from "../models/index.js";
import { seedAgents } from "./agents.js";

export const seedSwarms = async () => {
  try {
    // Clear existing swarms
    await Swarm.deleteMany({});

    // First seed the agents and get Stylus agents
    const stylusAgents = await seedAgents();
    const stylusAgentIds = stylusAgents.map(agent => agent._id);

    // Default swarm entries
    const defaultSwarms = [
      {
        name: "Stylus Development Swarm",
        description: "Expert swarm for Rust-based Stylus smart contract development on Arbitrum, specializing in WASM optimization and deployment.",
        icon: "⚡",
        category: "development",
        platform: "arbitrum",
        primaryLanguage: "rust",
        frameworks: ["Stylus", "cargo-stylus", "wasm-bindgen"],
        capabilities: [
          "Rust smart contract development",
          "WASM optimization",
          "Stylus framework expertise",
          "Arbitrum deployment",
          "Cross-contract interoperability",
          "Gas optimization",
          "Testing and verification"
        ],
        agents: stylusAgentIds,
        tasks: [
          "Write Stylus contracts in Rust",
          "Optimize WASM compilation",
          "Deploy to Arbitrum testnet",
          "Implement ERC standards",
          "Perform security audits"
        ]
      },
      {
        name: "Smart Contract Research",
        description: "A swarm dedicated to researching blockchain technologies and smart contract patterns.",
        icon: "🔬",
        category: "research",
        capabilities: [
          "Protocol analysis",
          "Pattern research",
          "Security assessment",
          "Performance benchmarking"
        ],
        agents: [],
        tasks: [
          "Research Layer 2 solutions",
          "Analyze DeFi protocols",
          "Study security patterns"
        ],
        createdAt: new Date(),
      },
      {
        name: "Development Ops",
        description: "A swarm focused on building and deploying smart contracts and dApps.",
        icon: "👨‍💻",
        category: "deployment",
        capabilities: [
          "CI/CD pipeline setup",
          "Automated testing",
          "Infrastructure management",
          "Monitoring setup"
        ],
        agents: [],
        tasks: [
          "Setup deployment pipeline",
          "Configure monitoring",
          "Manage infrastructure"
        ],
        createdAt: new Date(),
      },
      {
        name: "Community Management",
        description: "A swarm managing community engagement and social media presence.",
        icon: "🌐",
        category: "community",
        capabilities: [
          "Social media management",
          "Content creation",
          "Community moderation",
          "Event organization"
        ],
        agents: [],
        tasks: [
          "Manage Discord community",
          "Create educational content",
          "Organize AMAs"
        ],
        createdAt: new Date(),
      },
      {
        name: "Security Audit",
        description: "A swarm dedicated to security audits and best practices.",
        icon: "🛡️",
        category: "security",
        capabilities: [
          "Smart contract auditing",
          "Vulnerability assessment",
          "Security monitoring",
          "Incident response"
        ],
        agents: [],
        tasks: [
          "Audit smart contracts",
          "Monitor for threats",
          "Implement security protocols"
        ],
        createdAt: new Date(),
      },
      {
        name: "DeFi Protocol Swarm",
        description: "Expert swarm for DeFi protocol development and integration.",
        icon: "💰",
        category: "defi",
        capabilities: [
          "AMM development",
          "Lending protocol design",
          "Yield optimization",
          "Price oracle integration",
          "Liquidity pool management"
        ],
        agents: [],
        tasks: [
          "Design DeFi protocols",
          "Implement yield strategies",
          "Integrate price feeds",
          "Optimize gas usage"
        ],
        createdAt: new Date(),
      },
      {
        name: "NFT Innovation Swarm",
        description: "Specialized in NFT development and marketplace integration.",
        icon: "🎨",
        category: "nft",
        capabilities: [
          "NFT smart contract development",
          "Marketplace integration",
          "Metadata management",
          "Royalty implementation",
          "Token standards expertise"
        ],
        agents: [],
        tasks: [
          "Create NFT contracts",
          "Setup marketplace",
          "Implement royalties",
          "Manage metadata"
        ],
        createdAt: new Date(),
      },
      {
        name: "DAO Governance Swarm",
        description: "Focused on DAO setup and governance implementation.",
        icon: "🏛️",
        category: "dao",
        capabilities: [
          "Governance system design",
          "Voting mechanism implementation",
          "Treasury management",
          "Proposal system development",
          "Token distribution"
        ],
        agents: [],
        tasks: [
          "Setup DAO structure",
          "Implement voting",
          "Design tokenomics",
          "Create proposals"
        ],
        createdAt: new Date(),
      },
      {
        name: "GameFi Development Swarm",
        description: "Specialized in blockchain gaming and GameFi development.",
        icon: "🎮",
        category: "gaming",
        capabilities: [
          "Game smart contracts",
          "In-game economy design",
          "NFT integration",
          "Game mechanics",
          "Player rewards"
        ],
        agents: [],
        tasks: [
          "Design game economy",
          "Implement rewards",
          "Create game assets",
          "Balance mechanics"
        ],
        createdAt: new Date(),
      },
      {
        name: "Social Protocol Swarm",
        description: "Expert in decentralized social protocols and platforms.",
        icon: "🤝",
        category: "social",
        capabilities: [
          "Social graph development",
          "Content management",
          "Reputation systems",
          "Identity solutions",
          "Engagement mechanics"
        ],
        agents: [],
        tasks: [
          "Build social features",
          "Implement reputation",
          "Design engagement",
          "Manage content"
        ],
        createdAt: new Date(),
      },
      {
        name: "Analytics & Insights Swarm",
        description: "Focused on blockchain data analytics and insights.",
        icon: "📊",
        category: "analytics",
        capabilities: [
          "Data indexing",
          "Analytics dashboard development",
          "Metrics tracking",
          "Performance monitoring",
          "Insight generation"
        ],
        agents: [],
        tasks: [
          "Track metrics",
          "Generate reports",
          "Monitor trends",
          "Analyze data"
        ],
        createdAt: new Date(),
      }
    ];

    // Insert default swarms
    await Swarm.insertMany(defaultSwarms);
    console.log("Default swarms seeded successfully");

    // Return the created Stylus swarm for reference
    return await Swarm.findOne({ platform: "arbitrum" }).populate('agents');
  } catch (error) {
    console.error("Error seeding swarms:", error);
    throw error;
  }
};
