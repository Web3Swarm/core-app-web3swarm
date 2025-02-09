import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Conversation } from './types';

export type { Message, Conversation };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createMessage = (content: string, swarmId: string, conversationId: string): Message => {
  return {
    id: uuidv4(),
    content,
    role: 'user',
    timestamp: new Date(),
    swarmId,
    conversationId,
  };
};
