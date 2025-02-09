'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/lib/types';

interface AgentCardProps extends Agent {
  onClick?: () => void;
}

const categoryColors = {
  web3: 'bg-purple-100 hover:bg-purple-50',
  social: 'bg-blue-100 hover:bg-blue-50',
  productivity: 'bg-green-100 hover:bg-green-50',
  data: 'bg-orange-100 hover:bg-orange-50',
  development: 'bg-cyan-100 hover:bg-cyan-50',
};

export const AgentCard = ({
  name,
  description,
  icon,
  category,
  provider,
  isActive,
  onClick,
}: AgentCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border-2 border-black transition-all text-left',
        'shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
        categoryColors[category],
        isActive && 'ring-2 ring-black ring-offset-2'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-full h-full bg-white rounded-lg border-2 border-black overflow-hidden flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
          </div>
          {isActive && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs bg-white rounded-full border border-black">
              {provider}
            </span>
            <span className="px-2 py-0.5 text-xs bg-white rounded-full border border-black">
              {category}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}; 