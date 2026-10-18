import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface RevealProps {
  children: ReactNode;
  /** Delay in ms, used to stagger siblings. */
  delay?: number;
  /** How far the element travels up as it appears, in px. */
  y?: number;
  className?: string;
  style?: CSSProperties;
}

/** Fades and lifts its children into place the first time they scroll into view. */
export default function Reveal({ children, delay = 0, y = 28, className = '', style }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ ...style, '--reveal-delay': `${delay}ms`, '--reveal-y': `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
