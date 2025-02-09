'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SwarmCard } from '@/components/swarms/SwarmCard';
import { swarmsApi } from '@/lib/api';
import type { Swarm } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  const [swarms, setSwarms] = React.useState<Swarm[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Load swarms with populated agents
  React.useEffect(() => {
    if (mounted) {
      const loadSwarms = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const response = await swarmsApi.getAll();
          
          if (response.success && response.data) {
            setSwarms(response.data);
          } else {
            setError(response.error || 'Failed to load swarms');
          }
        } catch (err) {
          console.error('Failed to load swarms:', err);
          setError('An unexpected error occurred while loading swarms');
        } finally {
          setIsLoading(false);
        }
      };
      loadSwarms();
    }
  }, [mounted]);

  // Filter swarms based on search query
  const filteredSwarms = swarms.filter(swarm =>
    swarm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    swarm.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Welcome to Web3Swarm!
          </h1>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Your AI-powered Web3 companion
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover specialized AI swarms for development, DeFi, NFTs, and more
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="What would you like to accomplish today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full p-4 pl-12 pr-12 rounded-xl border-2 border-black bg-white",
                "focus:outline-none focus:ring-2 focus:ring-purple-400",
                "shadow-brutal hover:shadow-brutal-sm transition-all",
                "placeholder:text-gray-400 text-lg"
              )}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              🔍
            </span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              ⚡
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button className="px-4 py-2 bg-white border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-sm transition-all flex items-center gap-2">
            <span>🚀</span> Start New Project
          </button>
          <button className="px-4 py-2 bg-white border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-sm transition-all flex items-center gap-2">
            <span>💻</span> Deploy Contract
          </button>
          <button className="px-4 py-2 bg-white border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-sm transition-all flex items-center gap-2">
            <span>📊</span> Market Analysis
          </button>
          <button className="px-4 py-2 bg-white border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-sm transition-all flex items-center gap-2">
            <span>🔄</span> Automate Tasks
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 border-2 border-red-500 bg-red-50 rounded-xl shadow-brutal text-red-600">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Swarms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div 
                key={`skeleton-${i}`}
                className="h-48 bg-white rounded-xl border-2 border-black animate-pulse shadow-brutal"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSwarms.length === 0 ? (
              <div className="col-span-2 text-center p-8">
                <p className="text-gray-500">
                  {searchQuery ? 'No swarms match your search' : 'No swarms available'}
                </p>
              </div>
            ) : (
              filteredSwarms.map((swarm) => {
                const swarmId = swarm._id || swarm.id;
                if (!swarmId) return null; // Skip if no valid ID
                return (
                  <Link 
                    key={swarmId}
                    href={`/swarm/${swarmId}`} 
                    className="block"
                  >
                    <SwarmCard
                      id={swarmId}
                      name={swarm.name}
                      icon={swarm.icon || "🌐"}
                      description={swarm.description}
                      color={getSwarmColor(swarm.name)}
                      agents={swarm.agents?.map(agent => 
                        typeof agent === 'string' ? agent : agent.name
                      ) || []}
                      tasks={swarm.tasks || [
                        `${swarm.name} development`,
                        `${swarm.name} analysis`,
                        `${swarm.name} automation`,
                        `${swarm.name} optimization`
                      ]}
                    />
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Helper function to assign colors based on swarm name
function getSwarmColor(name: string): 'purple' | 'blue' | 'cyan' | 'green' {
  const colors: ('purple' | 'blue' | 'cyan' | 'green')[] = ['purple', 'blue', 'cyan', 'green'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
} 