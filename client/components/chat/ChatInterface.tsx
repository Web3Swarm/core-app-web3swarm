'use client';

import React from 'react';
import { type Message, type Conversation, cn } from '@/lib/utils';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, model: string) => void;
  isLoading?: boolean;
  swarmName?: string;
  swarmDescription?: string;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversation: Conversation) => void;
}

interface CodeBlock {
  language: string;
  code: string;
}

const extractCodeBlocks = (content: string): { text: string; codeBlocks: CodeBlock[] } => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: CodeBlock[] = [];
  const text = content.replace(codeBlockRegex, (_, lang = 'text', code) => {
    codeBlocks.push({ language: lang, code: code.trim() });
    return '[CODE_BLOCK]';
  });
  return { text, codeBlocks };
};

const models = [
  { id: 'gpt-4', name: 'OpenAI GPT-4', provider: 'openai' },
  { id: 'llama', name: 'Gaia LLaMA', provider: 'gaia' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  swarmName,
  swarmDescription,
  conversations,
  currentConversation,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [selectedModel, setSelectedModel] = React.useState('gpt-4');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [compiling, setCompiling] = React.useState(false);
  const [deploying, setDeploying] = React.useState(false);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom on new messages
  useAutoScroll(messagesEndRef, messages);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const message = inputValue;
    setInputValue('');
    onSendMessage(message, selectedModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const handleCompileCode = async (code: string, language: string) => {
    if (language.toLowerCase() !== 'rust') {
      console.error('Only Rust code compilation is supported');
      return;
    }

    try {
      setCompiling(true);
      const response = await fetch(`${API_URL}/api/project/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Compilation failed');
      }

      // Show compilation status without AI response
      const message = result.output ? 
        `✅ Compilation successful!\n\nOutput:\n${result.output}${result.warnings ? `\n\nWarnings:\n${result.warnings}` : ''}` :
        '✅ Compilation successful!';
      
      // Send as a system message
      onSendMessage(message, 'system');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      // Send error as system message
      onSendMessage(`❌ Compilation failed: ${errorMessage}`, 'system');
    } finally {
      setCompiling(false);
    }
  };

  const handleDeployCode = async (code: string, language: string) => {
    if (language.toLowerCase() !== 'rust') {
      console.error('Only Rust code deployment is supported');
      return;
    }

    try {
      setDeploying(true);
      const response = await fetch(`${API_URL}/api/project/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      // Add deployment result to messages
      onSendMessage(
        `✅ Deployment successful!\n\nContract Address: ${result.contractAddress}\nTransaction Hash: ${result.txHash}`,
        'system'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onSendMessage(`❌ Deployment failed: ${errorMessage}`, 'system');
    } finally {
      setDeploying(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const { text, codeBlocks } = extractCodeBlocks(message.content);

    return (
      <div
        key={message.id}
        className={cn(
          'flex w-full mb-4',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-[80%] rounded-lg p-4',
            isUser ? 'bg-black text-white' : 'bg-white border-2 border-black'
          )}
        >
          {text && <p className="whitespace-pre-wrap mb-4">{text}</p>}
          
          {codeBlocks.map((block, i) => (
            <div key={i} className="relative mb-4 last:mb-0">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                <code>{block.code}</code>
              </pre>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleCopyCode(block.code)}
                  className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  title="Copy code"
                >
                  📋
                </button>
                {block.language.toLowerCase() === 'rust' && (
                  <>
                    <button
                      onClick={() => handleCompileCode(block.code, block.language)}
                      disabled={compiling}
                      className={cn(
                        "px-2 py-1 rounded-lg text-white flex items-center gap-1 text-sm font-medium",
                        compiling ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-500"
                      )}
                      title="Compile Rust code"
                    >
                      {compiling ? (
                        <>
                          <span className="animate-spin">⚙️</span>
                          Compiling...
                        </>
                      ) : (
                        <>
                          🔨 Compile
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeployCode(block.code, block.language)}
                      disabled={deploying}
                      className={cn(
                        "px-2 py-1 rounded-lg text-white flex items-center gap-1 text-sm font-medium",
                        deploying ? "bg-gray-500" : "bg-green-600 hover:bg-green-500"
                      )}
                      title="Deploy to Stylus"
                    >
                      {deploying ? (
                        <>
                          <span className="animate-spin">⚙️</span>
                          Deploying...
                        </>
                      ) : (
                        <>
                          🚀 Deploy
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Swarm Header */}
        <div className="flex items-center gap-3 p-4 border-b-2 border-black bg-white sticky top-0 z-10">
          <div className="w-10 h-10 bg-purple-400 rounded-lg border-2 border-black flex items-center justify-center">
            <span className="text-2xl">🌐</span>
          </div>
          <div className="flex-1">
            {isLoading ? (
              <>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <h2 className="font-bold text-lg">{swarmName || 'Loading Swarm...'}</h2>
                <p className="text-sm text-gray-600">
                  {swarmDescription || 'Loading swarm details...'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="border-b-2 border-black bg-white">
          <div className="flex overflow-x-auto p-2 gap-2">
            {conversations.map((conv) => (
              <div key={conv.id} className="flex-shrink-0">
                <button
                  onClick={() => onSelectConversation(conv)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 border-black whitespace-nowrap",
                    currentConversation?.id === conv.id
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-100"
                  )}
                >
                  {conv.title || `Chat ${conv.id.slice(0, 6)}`}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv);
                    }}
                    className="ml-2 hover:text-red-500"
                  >
                    ×
                  </button>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => renderMessage(message))}
          {isLoading && (
            <div key="loading-indicator" className="flex gap-3 max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4">
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-brutal w-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-.3s]" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-.5s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <div className="border-t-2 border-black p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4">
              {/* Model selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-2 border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-sm transition-all bg-white"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>

              {/* Message input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border-2 border-black rounded-lg shadow-brutal hover:shadow-brutal-sm transition-all"
              />
              
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-black text-white rounded-lg border-2 border-black shadow-brutal hover:shadow-brutal-sm transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 