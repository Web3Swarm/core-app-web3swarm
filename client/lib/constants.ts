import type { NavigationItem, SwarmType, RecentChat, Agent } from './types';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    icon: 'home',
    label: 'Home',
    path: '/',
    description: 'Your personal workspace overview'
  },
  {
    icon: 'robot',
    label: 'Agentic Dashboard',
    path: '/dashboard',
    description: 'Manage and monitor your AI agents'
  },
  {
    icon: 'shared',
    label: 'Shared with me',
    path: '/shared',
    description: 'Access shared swarms and resources'
  },
  {
    icon: 'discover',
    label: 'Discover Swarms',
    path: '/discover',
    description: 'Explore and join new swarms'
  },
  {
    icon: 'agents',
    label: 'Agents',
    path: '/agents',
    description: 'Your AI agent collection'
  }
];

export const AGENTS: Agent[] = [
  {
    id: 'virtual-protocol',
    name: 'Virtual Protocol Agent',
    description: 'Virtual Protocol is a AI agent asset tokenization platform that enables seamless integration.',
    icon: '🌐',
    category: 'web3',
    provider: 'Web3Swarm',
    isActive: true
  },
  {
    id: 'onchain-monitor',
    name: 'On-chain Monitor',
    description: 'Stay informed and agile with the EVM Listener app, a powerful tool for blockchain monitoring.',
    icon: '📊',
    category: 'web3',
    provider: 'Web3Swarm'
  },
  {
    id: 'coinbase-dev',
    name: 'Coinbase Developer Portal',
    description: 'Coinbase MPC wallet allow you to trade and transfer assets on chain.',
    icon: '💰',
    category: 'web3',
    provider: 'Web3Swarm'
  },
  {
    id: 'dex-screener',
    name: 'Dex Screener Agent',
    description: 'DEX Screener is a platform that provides data directly from the blockchain.',
    icon: '📈',
    category: 'web3',
    provider: 'Web3Swarm',
    isActive: true
  },
  {
    id: 'rootdata',
    name: 'RootData Agent',
    description: 'RootData is a Crypto asset data platform that provides comprehensive analytics.',
    icon: '📊',
    category: 'data',
    provider: 'Web3Swarm',
    isActive: true
  },
  {
    id: 'blog-audio',
    name: 'Blog Audio Agent',
    description: 'Powered by ElevenLabs, can convert a blog post url to audio format.',
    icon: '🎧',
    category: 'productivity',
    provider: 'Web3Swarm'
  },
  {
    id: 'web3-aggregator',
    name: 'Aggregated Web3 Info',
    description: 'Aggregated web3 info can provide Web3 project analysis, tutorials, and insights.',
    icon: '🌐',
    category: 'web3',
    provider: 'Web3Swarm'
  },
  {
    id: 'youtube',
    name: 'Youtube Agent',
    description: 'YouTube is a global video-sharing platform where users can upload, share, and engage.',
    icon: '📺',
    category: 'social',
    provider: 'Web3Swarm'
  },
  {
    id: 'hacker-news',
    name: 'Hacker News Agent',
    description: 'Hacker News (HN) is a social news website focusing on computer science and entrepreneurship.',
    icon: '📰',
    category: 'development',
    provider: 'Web3Swarm'
  },
  {
    id: 'github',
    name: 'Github Agent',
    description: 'Boost collaboration and version control in your development workflow.',
    icon: '🐙',
    category: 'development',
    provider: 'Web3Swarm'
  },
  {
    id: 'oklink',
    name: 'OKLink Agent',
    description: 'OKLink | Welcome to OKLink Explorer APIs, an essential blockchain data tool.',
    icon: '🔗',
    category: 'web3',
    provider: 'Web3Swarm'
  },
  {
    id: 'techcrunch',
    name: 'Techcrunch Agent',
    description: 'Reporting on the business of technology, startups, venture capital funding.',
    icon: '📱',
    category: 'data',
    provider: 'Web3Swarm'
  },
  {
    id: 'stylus-dev',
    name: 'Stylus Development Agent',
    description: 'Expert in Rust-based smart contract development using Arbitrum Stylus, specializing in WASM optimization and ERC standards implementation.',
    icon: '⚡',
    category: 'development',
    provider: 'Web3Swarm',
    isActive: true
  },
  {
    id: 'wasm-optimizer',
    name: 'WASM Optimization Agent',
    description: 'Specializes in optimizing WebAssembly compilation and execution for Stylus smart contracts, focusing on performance and gas efficiency.',
    icon: '🔧',
    category: 'development',
    provider: 'Web3Swarm',
    isActive: true
  },
  {
    id: 'rust-contract-tester',
    name: 'Rust Contract Testing Agent',
    description: 'Focused on comprehensive testing of Rust-based Stylus smart contracts, including unit tests, integration tests, and security checks.',
    icon: '🧪',
    category: 'development',
    provider: 'Web3Swarm',
    isActive: true
  }
];

export const SWARM_TYPES: SwarmType[] = [
  {
    id: 'web3',
    name: 'Web3 Swarm',
    icon: '🌐',
    description: 'Stay ahead in Web3 with this swarm',
    color: 'purple',
    agents: ['RootData Agent', 'Dex Screener Agent']
  },
  {
    id: 'okx',
    name: 'OKX Swarm',
    icon: '📊',
    description: 'OKX exchange monitoring and trading',
    color: 'blue',
    agents: ['Trading Agent', 'Market Analysis Agent']
  },
  {
    id: 'twitter',
    name: 'Twitter Engagement',
    icon: '🐦',
    description: 'Automated Twitter management system',
    color: 'cyan',
    agents: ['Content Agent', 'Engagement Agent']
  },
  {
    id: 'crypto',
    name: 'Crypto Token Signal',
    icon: '💎',
    description: 'Cryptocurrency monitoring system',
    color: 'green',
    agents: ['Signal Agent', 'Analysis Agent']
  },
];

export const RECENT_CHATS: RecentChat[] = [
  {
    id: 'web3-creator',
    name: 'web3 creator post',
    path: '/chat/web3-creator',
    type: 'web3'
  },
  {
    id: 'web3-lido',
    name: 'web3 lido analysis',
    path: '/chat/web3-lido',
    type: 'web3'
  },
  {
    id: 'near-trends',
    name: 'near tweet trends',
    path: '/chat/near-trends',
    type: 'twitter'
  },
]; 