import { Icons } from "../icons";

const thinkingStyles = `
  @keyframes letter-pulse {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 1; }
  }

  .thinking-letter {
    display: inline-block;
    animation: letter-pulse 1.4s ease-in-out infinite;
  }

  @keyframes dot-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40%           { transform: translateY(-5px); opacity: 1; }
  }
    
  .thinking-dot {
    display: inline-block;
    animation: dot-bounce 1.2s ease-in-out infinite;
  }
`;

const THINKING_WORD = 'Thinking';

export const ThinkingRow = () => (
    <>
        <style>{thinkingStyles}</style>
        <div className="flex w-full items-center gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
                <Icons.brain
                    size={18}
                    className="text-muted-foreground shrink-0"
                    style={{
                        animation: 'letter-pulse 1.4s ease-in-out infinite',
                        animationDelay: '0s',
                    }}
                />

                <span className="text-sm font-medium text-muted-foreground tracking-wide select-none">
                    {THINKING_WORD.split('').map((char, i) => (
                        <span
                            key={i}
                            className="thinking-letter"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {char}
                        </span>
                    ))}
                </span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        style={{ animationDelay: `${i * 0.18}s` }}
                    />
                ))}
            </div>
        </div>
    </>
);