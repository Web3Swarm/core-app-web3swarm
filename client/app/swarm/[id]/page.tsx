'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { swarmsApi, chatApi } from '@/lib/api';
import type { Message, Swarm, Conversation } from '@/lib/types';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function SwarmChatPage({ params }: PageParams) {
  const [swarm, setSwarm] = React.useState<Swarm | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Properly unwrap the params Promise
  const { id } = React.use(params);

  // Load swarm data and conversations
  React.useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      try {
        const [swarmRes, conversationsRes] = await Promise.all([
          swarmsApi.getById(id),
          chatApi.getConversations(id)
        ]);

        if (swarmRes.success && swarmRes.data) {
          setSwarm(swarmRes.data);
        }
        if (conversationsRes.success && conversationsRes.data) {
          setConversations(conversationsRes.data);
        }
      } catch (err) {
        setError('Failed to load swarm data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Load messages when conversation changes
  React.useEffect(() => {
    async function loadMessages() {
      if (!id || !currentConversation) {
        setMessages([]);
        return;
      }
      
      try {
        const response = await chatApi.getMessages(id, currentConversation.id);
        if (response.success && response.data) {
          setMessages(response.data);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    }

    loadMessages();
  }, [id, currentConversation]);

  // Handle sending messages
  const handleSendMessage = async (content: string, model: string) => {
    if (!id) return;

    // Create a temporary message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      swarmId: id,
      conversationId: currentConversation?.id || '',
    };

    // Add temporary message to the UI
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await chatApi.sendMessage(
        id, 
        content, 
        model,
        currentConversation?.id
      );

      if (response.success && response.data) {
        const { conversation, userMessage, assistantMessage } = response.data;
        
        // Update conversations list
        setConversations(prev => {
          const existing = prev.find(c => c.id === conversation.id);
          if (existing) {
            return prev.map(c => c.id === conversation.id ? conversation : c);
          }
          return [conversation, ...prev];
        });

        // Set current conversation if this is a new one
        if (!currentConversation) {
          setCurrentConversation(conversation);
        }

        // Replace temp message with confirmed messages
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== tempMessage.id),
          userMessage,
          assistantMessage,
        ].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
      } else {
        // Handle error case
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        
        // Show error toast or message
        const errorMessage = response.error === 'Request timed out. Please try again.'
          ? 'Message took too long to send. Please try again.'
          : response.error || 'Failed to send message';
        
        console.error('Failed to send message:', errorMessage);
        
        // Add error message to chat
        const errorResponseMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
          swarmId: id,
          conversationId: currentConversation?.id || '',
        };
        setMessages(prev => [...prev, errorResponseMessage]);
      }
    } catch (error) {
      // Remove temporary message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      // Add error message to chat
      const errorResponseMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`,
        timestamp: new Date(),
        swarmId: id,
        conversationId: currentConversation?.id || '',
      };
      setMessages(prev => [...prev, errorResponseMessage]);
      console.error('Error sending message:', error);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  // Handle deleting a conversation
  const handleDeleteConversation = async (conversation: Conversation) => {
    if (!id) return;

    try {
      const response = await chatApi.deleteConversation(id, conversation.id);
      if (response.success) {
        setConversations(prev => prev.filter(c => c.id !== conversation.id));
        if (currentConversation?.id === conversation.id) {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-600">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ChatInterface 
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        swarmName={swarm?.name}
        swarmDescription={swarm?.description}
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
    </MainLayout>
  );
} 