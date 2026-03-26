'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  /** Current value of the text field. */
  value: string;
  /** Called on every keystroke to update the controlled value. */
  onChange: (value: string) => void;
  /** Called when the form is submitted with a non-empty message. */
  onSubmit: (message: string) => void;
  /** When `true` the send button is disabled and the field is read-only. */
  isLoading: boolean;
}

/**
 * Controlled textarea + send button that lives at the bottom of the chat pane.
 *
 * Submission is triggered either by clicking the Send button or by pressing
 * `Enter` without `Shift`. Blank messages are silently ignored.
 */
export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !isLoading) {
        onSubmit(trimmed);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2 items-center">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
        />
        <Button type="submit" disabled={value.trim() === '' || isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};