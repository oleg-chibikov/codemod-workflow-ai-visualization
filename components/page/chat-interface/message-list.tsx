'use client';

import { useEffect, useRef } from 'react';
import { ThinkingRow } from '@/components/page/chat-interface/thinking-row';
import { LangChainMessage } from '@/types/messages';
import { Message } from './message';

interface MessageListProps {
  /** All messages to render, in order. */
  messages: LangChainMessage[];
  /** When `true` a loading indicator is appended below the messages. */
  isLoading: boolean;
  /**
   * Fired once the last AI message finishes its typewriter animation.
   * Used by the parent to gate displaying the workflow diagram.
   */
  onLastAiMessageTypingDone: () => void;
}

/**
 * Scrollable list of chat messages with an auto-scroll-to-bottom behaviour.
 *
 * Renders a {@link ThinkingRow} spinner while `isLoading` is `true`, and
 * attaches a `onTypingDone` callback to the final AI message so the parent
 * knows when to reveal the workflow pane.
 */
export const MessageList = ({
  messages,
  isLoading,
  onLastAiMessageTypingDone,
}: MessageListProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  /** Scroll to the bottom whenever messages change or loading state toggles. */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {messages.map((message, i) => {
        const isLastAiMessage =
          message.type === 'ai' && i === messages.length - 1;

        return (
          <Message
            key={i}
            message={message}
            onTypingDone={
              isLastAiMessage ? onLastAiMessageTypingDone : undefined
            }
          />
        );
      })}

      {isLoading && <ThinkingRow />}

      {/* Invisible anchor kept at the bottom for auto-scroll. */}
      <div ref={endRef} />
    </div>
  );
};