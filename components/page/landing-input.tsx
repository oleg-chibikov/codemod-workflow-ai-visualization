import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';

export const LandingInput = ({
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