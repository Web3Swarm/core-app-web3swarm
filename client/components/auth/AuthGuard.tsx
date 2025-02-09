'use client';

import { usePrivy } from '@privy-io/react-auth';
import { cn } from '@/lib/utils';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen">
        {/* Left side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 p-12 items-center bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-white border-2 border-black rounded-xl shadow-brutal mb-8">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                Orchestrate multi-agent to take action on autopilot
              </h1>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-lg shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                <div className="w-8 h-8 rounded-lg bg-purple-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="font-medium">Easy setup with natural language</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-lg shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                <div className="w-8 h-8 rounded-lg bg-pink-400 border-2 border-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="font-medium">Start with free trial, no credit card required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Simple Login Button */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100">
          <div className="w-full max-w-md">
            <div className="p-8 bg-white border-2 border-black rounded-xl shadow-brutal text-center transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl border-2 border-black mx-auto mb-6 flex items-center justify-center shadow-brutal-sm">
                <span className="text-4xl">🤖</span>
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-transparent bg-clip-text">
                Welcome to Web3Swarm
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Your AI-powered Web3 companion
              </p>
              <button
                onClick={login}
                className={cn(
                  "w-full p-4 bg-black text-white rounded-xl border-2 border-black",
                  "shadow-brutal-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all",
                  "font-bold text-lg"
                )}
              >
                Login / Sign up
              </button>
              <p className="text-sm text-gray-600 mt-6">
                By continuing, you agree to Web3Swarm&apos;s{' '}
                <a href="#" className="text-cyan-500 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-cyan-500 hover:underline font-medium">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 