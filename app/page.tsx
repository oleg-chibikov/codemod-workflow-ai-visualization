'use client';

import { useState } from 'react';
import { Workflow } from '@/components/types';
import { v4 as uuid } from 'uuid';
import { LangChainMessage } from '@/types/messages';
import { aiMessage, mockWorkflow } from '@/mocks/mock-data';
import { LandingInput } from '@/components/page/landing-input';
import { ChatInterface } from '@/components/page/chat-interface';

export default function IndexPage() {
  const [messages, setMessages] = useState<LangChainMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  const handleSendMessage = async (content: string) => {
    // Set chat as started
    if (!chatStarted) {
      setChatStarted(true);
    }

    // Add user message to chat
    const userMessage: LangChainMessage = {
      id: uuid(),
      type: 'human',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessages((prev) => [...prev, aiMessage]);
      setWorkflow(mockWorkflow);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: LangChainMessage = {
        id: uuid(),
        type: 'ai',
        content:
          'Sorry, there was an error processing your request. Please try again.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      {!chatStarted ? (
        <LandingInput onSubmit={handleSendMessage} />
      ) : (
        <div>
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            workflow={workflow}
          />
        </div>
      )}
    </section>
  );
}
