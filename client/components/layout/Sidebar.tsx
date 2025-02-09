'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAVIGATION_ITEMS, RECENT_CHATS } from '@/lib/constants';
import { Tooltip } from '../ui/Tooltip';
import * as Icons from '../ui/icons';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const iconComponents: { [key: string]: React.ComponentType } = {
  'home': Icons.HomeIcon,
  'robot': Icons.RobotIcon,
  'shared': Icons.SharedIcon,
  'discover': Icons.DiscoverIcon,
  'agents': Icons.AgentsIcon,
  'invite': Icons.InviteIcon,
};

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, signMessage, ready } = usePrivy();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const hasAttemptedAuth = React.useRef(false);

  // Get display name from user object
  const displayName = React.useMemo(() => {
    if (typeof user?.email === 'string') return user.email;
    if (user?.wallet?.address) {
      return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`;
    }
    return 'Anonymous';
  }, [user]);

  // Reset auth state when user changes
  React.useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
      hasAttemptedAuth.current = false;
    }
  }, [user]);

  // Handle backend authentication when user logs in
  React.useEffect(() => {
    const authenticateUser = async () => {
      // Only proceed if we have all required conditions
      if (!ready || !user?.wallet?.address || isAuthenticated || hasAttemptedAuth.current) {
        return;
      }

      try {
        hasAttemptedAuth.current = true;
        const message = `Welcome to Web3Swarm!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${user.wallet.address}\nTimestamp: ${new Date().toISOString()}`;
        
        console.log('Starting authentication process:', {
          walletAddress: user.wallet.address,
          message
        });
        
        // Customize the sign message UI
        const uiConfig = {
          title: "Welcome to Web3Swarm",
          description: "Please sign to verify your wallet",
          buttonText: "Sign & Continue",
          showWalletUIs: false
        };
        
        const signatureResponse = await signMessage({ message }, { uiOptions: uiConfig });
        
        // Extract the signature from the response object
        let signature: string;
        if (typeof signatureResponse === 'string') {
          signature = signatureResponse;
        } else if (signatureResponse && typeof signatureResponse === 'object' && 'signature' in signatureResponse) {
          signature = (signatureResponse as { signature: string }).signature;
        } else {
          throw new Error('Failed to get valid signature from wallet');
        }

        if (!signature || typeof signature !== 'string') {
          throw new Error('Invalid signature format');
        }

        // Use the correct API URL
        const response = await axios.post(`${API_URL}/api/users/auth`, {
          address: user.wallet.address.toLowerCase(),
          signature,
          message,
        });

        if (response.data.success) {
          console.log('User authenticated successfully:', response.data);
          setIsAuthenticated(true);
        } else {
          console.error('Authentication failed:', response.data.error);
          hasAttemptedAuth.current = false;
        }
      } catch (error) {
        // Reset authentication attempt flag
        hasAttemptedAuth.current = false;
        
        // Detailed error logging
        if (axios.isAxiosError(error)) {
          console.error('Authentication network error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
        } else if (error instanceof Error) {
          console.error('Authentication error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        } else {
          console.error('Unknown authentication error:', error);
        }
        
        // Reset authenticated state
        setIsAuthenticated(false);
      }
    };

    authenticateUser();
  }, [ready, user?.wallet?.address, isAuthenticated, signMessage]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setIsAuthenticated(false);
      hasAttemptedAuth.current = false;
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r-4 border-black p-4 flex flex-col">
      {/* Profile Section */}
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "w-full flex items-center gap-2 p-3 mb-2 bg-[#f0f0f0] border-2 border-black rounded-lg shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          )}
        >
          <div className="w-10 h-10 bg-purple-400 rounded-lg border-2 border-black overflow-hidden flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-bold truncate">
              {displayName}
            </h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
          </div>
          <span className="text-lg">▾</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-brutal z-50">
            <button
              onClick={handleLogout}
              className="w-full p-3 text-left hover:bg-[#f0f0f0] flex items-center gap-2 text-red-500"
            >
              <span className="text-lg">🚪</span>
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = iconComponents[item.icon];
            return (
              <li key={item.path}>
                <Tooltip content={item.description} side="right">
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      "hover:bg-[#f0f0f0] hover:shadow-brutal border-2 border-transparent",
                      pathname === item.path && "bg-[#f0f0f0] border-black shadow-brutal"
                    )}
                  >
                    <div className="w-6 h-6 relative flex items-center justify-center">
                      {IconComponent && <IconComponent />}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* New Chat Button */}
      <button className="mt-4 w-full p-3 bg-black text-white rounded-lg border-2 border-black shadow-brutal-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
        + New Chat
      </button>

      {/* Recent Chats */}
      <div className="mt-4">
        <h3 className="font-bold mb-2">Recent</h3>
        <ul className="space-y-2">
          {RECENT_CHATS.map((chat) => (
            <li key={chat.id}>
              <Link
                href={chat.path}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg",
                  "hover:bg-[#f0f0f0] hover:shadow-brutal border-2 border-transparent",
                  pathname === chat.path && "bg-[#f0f0f0] border-black shadow-brutal"
                )}
              >
                ○ {chat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 