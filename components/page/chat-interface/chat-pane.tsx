'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LangChainMessage } from '@/types/messages';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ChatInput } from './chat-input';
import { MessageList } from './message-list';
import { MobileView } from './mobile-toggle';

interface ChatPaneProps {
  /** All messages to display. */
  messages: LangChainMessage[];
  /** Whether the AI is currently generating a response. */
  isLoading: boolean;
  /** Called when the user submits a new message. */
  onSendMessage: (message: string) => void;
  /** Whether the workflow diagram is visible; controls pane width. */
  hasWorkflow: boolean;
  /** Active mobile view — hides this pane when `'workflow'` is selected. */
  mobileView: MobileView;
  /** Fired once the last AI message finishes its typewriter animation. */
  onLastAiMessageTypingDone: () => void;
}

/** Spring transition shared between layout animations. */
const SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

/**
 * Left pane of the two-pane layout containing the message list and input.
 *
 * On desktop it expands to fill the full width when no workflow is shown, then
 * shrinks to 40 % once a workflow diagram appears. On mobile it respects the
 * `mobileView` toggle and occupies the full viewport width.
 */
export const ChatPane = ({
  messages,
  isLoading,
  onSendMessage,
  hasWorkflow,
  mobileView,
  onLastAiMessageTypingDone,
}: ChatPaneProps) => {
  const [input, setInput] = useState('');

  /**
   * On mobile the pane always occupies the full viewport width — framer-motion
   * must not constrain it or centre it, since the tab toggle handles visibility
   * via CSS (`hidden`/`flex`).
   */
  const isMobile = useIsMobile();

  const handleSend = (message: string) => {
    onSendMessage(message);
    setInput('');
  };

  return (
    <motion.div
      className={cn(
        'flex h-full overflow-hidden shrink-0',
        mobileView === 'workflow'
          ? 'hidden md:flex'
          : 'flex md:flex w-full md:w-auto'
      )}
      animate={{
        width:       isMobile ? '100%' : hasWorkflow ? '40%' : 'min(100%, 800px)',
        marginLeft:  isMobile ? '0px'  : hasWorkflow ? '0px' : 'auto',
        marginRight: isMobile ? '0px'  : hasWorkflow ? '0px' : 'auto',
      }}
      transition={SPRING}
    >
      <Card className="flex h-full w-full flex-col overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden pb-0">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onLastAiMessageTypingDone={onLastAiMessageTypingDone}
          />
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};