import OpenAI from 'openai';
import axios from 'axios';
import { BaseService } from './base.service.js';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  swarmId: string;
}

type SwarmCategory = 
  | 'development' 
  | 'research' 
  | 'security' 
  | 'defi' 
  | 'nft' 
  | 'dao' 
  | 'gaming' 
  | 'social' 
  | 'analytics' 
  | 'deployment' 
  | 'community';

export class AIService extends BaseService {
  private static instance: AIService;
  private openai: OpenAI;
  private gaiaUrl: string;

  private constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.gaiaUrl = process.env.GAIANET_SERVER_URL || 'https://llama8b.gaia.domains/v1';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async start(): Promise<void> {
    // Initialize any necessary resources
    return Promise.resolve();
  }

  private getSwarmSystemPrompt(category: string): string {
    const prompts: Record<SwarmCategory, string> = {
      development: `You are a development swarm specialized in Rust-based Stylus smart contract development for Arbitrum. 
      
Key Capabilities:
- Write smart contracts in Rust targeting the Stylus framework
- Optimize WebAssembly (WASM) compilation and execution
- Implement ERC standards (ERC20, ERC721) in Rust
- Deploy and interact with contracts on Arbitrum
- Cross-contract interoperability between Solidity and Rust
- Gas optimization techniques for WASM contracts

Development Context:
- Stylus is Arbitrum's WASM-based VM running alongside EVM
- Contracts are written in Rust and compiled to WASM
- Focus on memory and compute-intensive optimizations
- Support for standard Ethereum interfaces and events
- Integration with existing Solidity contracts

Best Practices:
- Use Rust idioms and memory safety features
- Optimize WASM size and execution efficiency
- Follow ERC standards for compatibility
- Implement comprehensive testing
- Consider gas costs in contract design

Always provide code examples in Rust, not Solidity. Focus on WASM optimization and Arbitrum-specific features.`,
      research: "You are a research swarm analyzing blockchain technologies and patterns. Provide detailed analysis and insights.",
      security: "You are a security audit swarm focused on smart contract security. Identify vulnerabilities and suggest improvements.",
      defi: "You are a DeFi protocol swarm specialized in decentralized finance. Help with protocol design and implementation.",
      nft: "You are an NFT innovation swarm focused on NFT development and marketplace integration.",
      dao: "You are a DAO governance swarm helping with DAO setup and governance implementation.",
      gaming: "You are a GameFi development swarm specialized in blockchain gaming mechanics and tokenomics.",
      social: "You are a social protocol swarm focused on decentralized social platforms and engagement.",
      analytics: "You are an analytics swarm providing insights on blockchain data and metrics.",
      deployment: "You are a deployment swarm focused on infrastructure setup and monitoring.",
      community: "You are a community management swarm helping with engagement and growth."
    };
    return prompts[category as SwarmCategory] || "You are a helpful Web3Swarm AI assistant.";
  }

  public async getSwarmResponse(
    message: string,
    category: string,
    model: string = 'gpt-4'
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    try {
      let response;
      
      if (model.startsWith('gpt')) {
        response = await this.getOpenAIResponse(message, category);
      } else if (model === 'llama') {
        response = await this.getGaiaResponse(message, category);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }

      return {
        userMessage: {
          id: uuidv4(),
          content: message,
          role: 'user',
          timestamp: new Date(),
          swarmId: '',
        },
        assistantMessage: {
          id: uuidv4(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          swarmId: '',
        },
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  private async getOpenAIResponse(
    message: string,
    category: string
  ): Promise<string> {
    try {
      const systemPrompt = this.getSwarmSystemPrompt(category);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          { role: "user", content: message },
        ],
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw error;
    }
  }

  private async getGaiaResponse(
    message: string,
    category: string
  ): Promise<string> {
    try {
      const systemPrompt = this.getSwarmSystemPrompt(category);
      const response = await axios.post(this.gaiaUrl, {
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        model: process.env.GAIANET_MODEL || "llama",
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      });

      // Extract response in OpenAI format
      if (response.data && response.data.choices && response.data.choices[0]) {
        return response.data.choices[0].message?.content || 'No response generated';
      }

      throw new Error('Invalid response format from Gaia API');
    } catch (error) {
      console.error('Gaia API Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: this.gaiaUrl,
        category
      });
      
      if (axios.isAxiosError(error)) {
        throw new Error(`Gaia API request failed: ${error.response?.data?.error || error.message}`);
      }
      
      throw error;
    }
  }

  public async stop(): Promise<void> {
    // Cleanup if needed
  }
} 