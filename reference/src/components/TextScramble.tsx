import { useEffect, useState } from 'react';

interface TextScrambleProps {
  text: string;
  delay?: number;
  duration?: number;
}

export function TextScramble({ text, delay = 0, duration = 250 }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(true);

  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let frame = 0;
    let frameRequest: number;
    let startTime: number;
    
    const queue: Array<{
      from: string;
      to: string;
      start: number;
      end: number;
      char?: string;
    }> = [];

    // Convert duration from milliseconds to frames (60fps)
    const durationFrames = (duration / 1000) * 60;

    for (let i = 0; i < text.length; i++) {
      const from = chars[Math.floor(Math.random() * chars.length)];
      const to = text[i];
      const start = Math.random() * 10;
      const end = start + Math.random() * durationFrames;
      queue.push({ from, to, start, end });
    }

    const update = () => {
      let output = '';
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end, char } = queue[i];

        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = chars[Math.floor(Math.random() * chars.length)];
            queue[i].char = char;
          }
          output += `<span class="text-accent">${char}</span>`;
        } else {
          output += from;
        }
      }

      setDisplayText(output);

      if (complete === queue.length) {
        setIsScrambling(false);
      } else {
        frameRequest = requestAnimationFrame(update);
        frame++;
      }
    };

    const startAnimation = () => {
      startTime = Date.now();
      frame = 0;
      setIsScrambling(true);
      frameRequest = requestAnimationFrame(update);
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (frameRequest) {
        cancelAnimationFrame(frameRequest);
      }
    };
  }, [text, delay, duration]);

  return (
    <span 
      className={`inline-block ${isScrambling ? 'opacity-90' : 'opacity-100'}`}
      dangerouslySetInnerHTML={{ __html: displayText || text }}
    />
  );
}