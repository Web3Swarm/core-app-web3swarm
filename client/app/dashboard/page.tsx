import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SwarmCard } from '@/components/swarms/SwarmCard';
import { SWARM_TYPES } from '@/lib/constants';

export default function DashboardPage() {
  // For demo, showing first two swarms as active
  const activeSwarms = SWARM_TYPES.slice(0, 2);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Agentic Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage your active AI swarms
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal">
            <h3 className="text-sm text-gray-600 mb-1">Active Swarms</h3>
            <p className="text-3xl font-bold">{activeSwarms.length}</p>
          </div>
          <div className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal">
            <h3 className="text-sm text-gray-600 mb-1">Total Agents</h3>
            <p className="text-3xl font-bold">
              {activeSwarms.reduce((acc, swarm) => acc + swarm.agents.length, 0)}
            </p>
          </div>
          <div className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal">
            <h3 className="text-sm text-gray-600 mb-1">Tasks Today</h3>
            <p className="text-3xl font-bold">24</p>
          </div>
        </div>

        {/* Active Swarms */}
        <h2 className="text-2xl font-bold mb-4">Active Swarms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSwarms.map((swarm) => (
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

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <span className="text-2xl mb-2 block">🚀</span>
              <span className="font-medium">Launch Swarm</span>
            </button>
            <button className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <span className="text-2xl mb-2 block">🎯</span>
              <span className="font-medium">Add Agent</span>
            </button>
            <button className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <span className="text-2xl mb-2 block">📊</span>
              <span className="font-medium">View Reports</span>
            </button>
            <button className="p-4 bg-white border-2 border-black rounded-lg shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <span className="text-2xl mb-2 block">⚙️</span>
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 