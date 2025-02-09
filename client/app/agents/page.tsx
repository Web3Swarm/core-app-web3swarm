'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { AgentCard } from '@/components/agents/AgentCard';
import { AGENTS } from '@/lib/constants';
import type { Agent } from '@/lib/types';
import { cn } from '@/lib/utils';

const categories = ['all', 'web3', 'social', 'productivity', 'data', 'development'] as const;

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<typeof categories[number]>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredAgents = AGENTS.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAgentClick = (agent: Agent) => {
    console.log('Agent clicked:', agent.name);
    // Add your agent activation logic here
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
          <p className="text-gray-600">
            Customize workflow with dozens of integrations and workers to power your work.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 border-black transition-all whitespace-nowrap',
                  'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
                  selectedCategory === category
                    ? 'bg-black text-white shadow-none'
                    : 'bg-white shadow-brutal'
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Made by Web3Swarm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                {...agent}
                onClick={() => handleAgentClick(agent)}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 