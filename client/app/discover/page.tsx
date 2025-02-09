import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SwarmCard } from '@/components/swarms/SwarmCard';
import { SWARM_TYPES } from '@/lib/constants';

export default function DiscoverPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Swarms</h1>
          <p className="text-gray-600">
            Explore and join AI swarms to enhance your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SWARM_TYPES.map((swarm) => (
            <SwarmCard
              key={swarm.id}
              id={swarm.id}
              name={swarm.name}
              icon={swarm.icon}
              description={swarm.description}
              color={swarm.color}
              agents={swarm.agents}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 