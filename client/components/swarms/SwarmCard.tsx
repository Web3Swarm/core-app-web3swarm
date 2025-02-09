import React from 'react';
import { cn } from '@/lib/utils';

interface SwarmCardProps {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: 'purple' | 'blue' | 'cyan' | 'green';
  agents?: string[];
  tasks?: string[];
}

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-400',
    shadow: 'shadow-brutal-purple',
    border: 'hover:border-purple-400',
    task: 'hover:bg-purple-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-400',
    shadow: 'shadow-brutal-blue',
    border: 'hover:border-blue-400',
    task: 'hover:bg-blue-100',
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'bg-cyan-400',
    shadow: 'shadow-brutal-cyan',
    border: 'hover:border-cyan-400',
    task: 'hover:bg-cyan-100',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-400',
    shadow: 'shadow-brutal-green',
    border: 'hover:border-green-400',
    task: 'hover:bg-green-100',
  },
};

export const SwarmCard: React.FC<SwarmCardProps> = ({
  name,
  description,
  icon = '🌐',
  color = 'purple',
  agents = [],
  tasks = [],
}) => {
  const colors = colorClasses[color];

  return (
    <div 
      className={cn(
        'p-6 rounded-xl border-2 border-black',
        colors.bg,
        colors.shadow,
        colors.border,
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn(
          'w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0',
          colors.icon
        )}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl mb-1 truncate">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Integrations */}
      {agents.length > 0 && (
        <div className="flex gap-1 mb-4">
          {agents.map((agent, index) => (
            <img
              key={index}
              src="/path/to/integration/icon.png"
              alt={agent}
              className="w-6 h-6 rounded-full border border-black"
            />
          ))}
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <button
              key={index}
              className={cn(
                'w-full p-3 text-left text-sm rounded-lg border border-black bg-white',
                'hover:shadow-brutal-sm transition-all',
                colors.task,
                'flex items-center gap-2'
              )}
            >
              <span className="w-5 h-5 rounded-full border border-black flex items-center justify-center flex-shrink-0">
                ○
              </span>
              <span className="truncate">{task}</span>
              <span className="ml-auto flex-shrink-0">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 