'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { Workflow } from '@/components/types';
import { cn } from '@/lib/utils';
import { ButterflowWorkflowVisualization } from '@/components/page/workflow-visualization';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { LangChainMessage } from '@/types/messages';
import { ThinkingRow } from '@/components/ui/thinking-row';
import { Message } from './message';

export const ChatInterface = ({
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
                {isLoading && <ThinkingRow />}
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