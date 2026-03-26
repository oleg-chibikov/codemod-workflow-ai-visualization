import { useState, useEffect } from "react";

export const useTypewriter = (text: string, enabled: boolean, speed = 18) => {
  const [displayed, setDisplayed] = useState(enabled ? '' : text);

  useEffect(() => {
    if (!enabled) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  return { displayed, isDone: displayed.length >= text.length };
};