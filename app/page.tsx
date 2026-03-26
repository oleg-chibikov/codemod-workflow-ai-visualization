'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { Workflow } from '@/components/types';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import { ButterflowWorkflowVisualization } from '@/components/workflow-visualization';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';
import { LangChainMessage } from '@/types/messages';
import { aiMessage, mockWorkflow } from '@/mockData/mockData';

const LandingInput = ({
  onSubmit,
}: {
  onSubmit: (message: string) => void;
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="h-[calc(100vh-70px)] flex flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-4xl font-bold">Workflow AI</h1>
      <form
        onSubmit={handleSubmit}
        className="group relative w-full max-w-lg focus-within:scale-105"
      >
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          placeholder="Ask anything..."
          className="h-14 pr-12 text-lg shadow-lg"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100"
          disabled={!input.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

// Chat message component
const Message = ({
  message,
  onTypingDone,
}: {
  message: LangChainMessage;
  onTypingDone?: () => void;
}) => {
  const isAi = message.type === 'ai';
  const fullText =
    typeof message.content === 'string'
      ? message.content
      : message.content.map((c) => c.text).join('');

  const { displayed, isDone } = useTypewriter(fullText, isAi);

  // Fire the callback exactly once when this AI message finishes typing
  const hasNotified = useRef(false);
  useEffect(() => {
    if (isDone && isAi && !hasNotified.current) {
      hasNotified.current = true;
      onTypingDone?.();
    }
  }, [isDone, isAi, onTypingDone]);

  return (
    <div className={cn('flex w-full gap-2 p-4', isAi ? 'bg-muted/50' : 'bg-background')}>
      <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full', isAi ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
        {isAi ? 'AI' : 'Y'}
      </div>
      <div className="flex-1">
        <p className="whitespace-pre-wrap text-sm">
          {displayed}
          {isAi && !isDone && (
            <span className="ml-0.5 inline-block w-0.5 h-4 bg-current align-middle animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
};

const ChatInterface = ({
  messages,
  isLoading,
  onSendMessage,
  workflow,
}: {
  messages: LangChainMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  workflow: Workflow | null;
}) => {
  const [input, setInput] = useState('');
  const [showMobileView, setShowMobileView] = useState<'chat' | 'workflow'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Whether the last AI message has finished typewriting
  const [workflowReady, setWorkflowReady] = useState(false);

  // Signals to the workflow visualization that the pane animation is done
  const [workflowPaneReady, setWorkflowPaneReady] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // When a new workflow arrives, reset both ready flags so we wait for
  // the new typewriter to finish before showing it.
  useEffect(() => {
    if (workflow) {
      setWorkflowReady(false);
      setWorkflowPaneReady(false);
    }
  }, [workflow]);

  // Re-reset pane-ready whenever workflowReady flips on (pane slides in fresh)
  useEffect(() => {
    if (workflowReady) {
      setWorkflowPaneReady(false);
    }
  }, [workflowReady]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Gate the displayed workflow on typewriting being complete
  const hasWorkflow = workflowReady && workflow !== null;

  // Track whether we're in the tabbed (mobile) layout
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const leftPaneWidth = isMobile ? '100%' : hasWorkflow ? '40%' : 'min(100%, 800px)';
  const leftPaneTranslate = hasWorkflow ? '0%' : '0%';
  const rightPaneWidth = isMobile ? '100%' : hasWorkflow ? '60%' : '0%';
  const rightPaneOpacity = isMobile ? 1 : hasWorkflow ? 1 : 0;
  const rightPaneTranslate = isMobile ? '0%' : hasWorkflow ? '0%' : '5%';

  return (
    <div className="h-[calc(100vh-70px)] w-full px-4 py-2 md:px-8">
      {/* Mobile Toggle - Only on mobile */}
      <div className="mb-2 flex md:hidden">
        <Button
          variant={showMobileView === 'chat' ? 'default' : 'outline'}
          onClick={() => setShowMobileView('chat')}
          className="flex-1 rounded-none"
        >
          Chat
        </Button>
        <Button
          variant={showMobileView === 'workflow' ? 'default' : 'outline'}
          onClick={() => setShowMobileView('workflow')}
          className="flex-1 rounded-none"
          disabled={!hasWorkflow}
        >
          Workflow
          {hasWorkflow && <Badge className="ml-2">1</Badge>}
        </Button>
      </div>

      {/* Main two-pane layout container */}
      <div className="relative flex h-[calc(100%-40px)] w-full md:h-full">
        {/* Left pane - Chat */}
        <motion.div
          className={cn(
            'flex h-full overflow-hidden shrink-0',
            showMobileView === 'workflow' ? 'hidden md:flex' : 'flex md:flex w-full md:w-auto'
          )}
          animate={{
            width: leftPaneWidth,
            x: leftPaneTranslate,
            marginLeft: hasWorkflow ? '0px' : 'auto',
            marginRight: hasWorkflow ? '0px' : 'auto',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <Card className="flex h-full w-full flex-col overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-hidden pb-0">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-2">
                {messages.map((message, i) => {
                  // Only attach the callback to the last AI message
                  const isLastAiMessage =
                    message.type === 'ai' && i === messages.length - 1;
                  return (
                    <Message
                      key={i}
                      message={message}
                      onTypingDone={
                        isLastAiMessage
                          ? () => setWorkflowReady(true)
                          : undefined
                      }
                    />
                  );
                })}
                {isLoading && (
                  <div className="flex items-center gap-1 p-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2 items-center">
                  <Textarea
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInput(e.target.value)
                    }
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={input.trim() === '' || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right pane - Workflow visualization */}
        <motion.div
          className={cn(
            'flex h-full overflow-hidden',
            showMobileView === 'chat' ? 'hidden md:flex' : 'flex w-full md:w-auto'
          )}
          animate={{
            width: rightPaneWidth,
            opacity: rightPaneOpacity,
            x: rightPaneTranslate,
          }}
          initial={{
            width: '0%',
            opacity: 0,
            x: '5%',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
          style={{ pointerEvents: hasWorkflow ? 'auto' : 'none' }}
          // Fire once the spring animation has settled — at this point the
          // pane has its final dimensions so ReactFlow can fitView correctly.
          onAnimationComplete={() => {
            if (hasWorkflow) setWorkflowPaneReady(true);
          }}
        >
          <Card className="flex h-full w-full flex-col overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle>Workflow Diagram</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 pt-2">
              <AnimatePresence>
                {hasWorkflow && (
                  <motion.div
                    className="h-full w-full"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <ButterflowWorkflowVisualization
                      workflow={{ workflow }}
                      tasks={[]}
                      fitViewReady={workflowPaneReady}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default function IndexPage() {
  const [messages, setMessages] = useState<LangChainMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const _threadId = useRef(uuid());

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
