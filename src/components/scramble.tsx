'use client';
import { useEffect, useRef, useState } from 'react';
export function Scramble({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const start = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cancelAnimationFrame(frame.current);
    const began = performance.now();
    const draw = (now: number) => {
      const progress = Math.min(1, (now - began) / 500);
      setDisplay([...text].map((letter, i) => i < progress * text.length || letter === ' ' ? letter : '✳+*#'[Math.floor(Math.random() * 4)]).join(''));
      if (progress < 1) frame.current = requestAnimationFrame(draw);
    };
    frame.current = requestAnimationFrame(draw);
  };
  return <span onPointerEnter={start} aria-label={text}><span aria-hidden="true">{display}</span></span>;
}
