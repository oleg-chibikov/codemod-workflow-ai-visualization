import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";
import { LangChainMessage } from "@/types/messages";
import { useRef, useEffect } from "react";

// Chat message component
export const Message = ({
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
    <div className={cn('flex w-full gap-2 p-4 items-center', isAi ? 'bg-muted/50' : 'bg-background')}>
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