import { useRef, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface TiltLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Maximum tilt in degrees. */
  max?: number;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/** A link card that leans toward the pointer, with a soft glare that follows it. Mouse only. */
export default function TiltLink({ to, children, className = '', style, max = 9, onClick }: TiltLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const el = ref.current;
    el.classList.add('is-tilting');
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
    el.style.setProperty('--lift', '-6px');
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--lift', '0px');
  };

  return (
    <Link
      ref={ref}
      to={to}
      className={`tilt ${className}`}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onClick}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </Link>
  );
}
