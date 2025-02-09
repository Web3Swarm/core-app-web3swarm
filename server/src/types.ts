export interface IAccountInfo {
  pkpAddress: string;
  evm: {
    chainId: number;
    address: string;
  }[];
  solana: {
    network: string;
    address: string;
  }[];
}

export interface IExecuteUserOpRequest {
  target: string;
  value: string;
  calldata: string;
}

export interface IExecuteUserOpResponse {
  userOperationHash: string;
  chainId: number;
}

export interface ITransactionReceipt {
  transactionHash?: string;
  transactionIndex?: number;
  blockHash?: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  cumulativeGasUsed?: number;
  status?: string;
  gasUsed?: number;
  contractAddress?: string | null;
  logsBloom?: string;
  effectiveGasPrice?: number;
}

export interface ILog {
  data?: string;
  blockNumber?: number;
  blockHash?: string;
  transactionHash?: string;
  logIndex?: number;
  transactionIndex?: number;
  address?: string;
  topics?: string[];
}

export interface IUserOperationReceipt {
  userOpHash?: string;
  entryPoint?: string;
  sender?: string;
  nonce?: number;
  paymaster?: string;
  actualGasUsed?: number;
  actualGasCost?: number;
  success?: boolean;
  receipt?: ITransactionReceipt;
  logs?: ILog[];
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  provider: string;
  isActive?: boolean;
}

// Swarm Types
export interface Swarm {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  swarmId: string;
  agentId?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
