import { useId } from 'react';

interface RakhiThreadProps {
  className?: string;
  variant?: 'rose' | 'gold' | 'sage';
}

const themes = {
  rose: {
    maroon: '#A30F3A',
    deepMaroon: '#7D102D',
    gold: '#FFD02E',
    saffron: '#F59A13',
    thread: '#FFF3A8',
    threadShadow: '#E7B631',
  },
  gold: {
    maroon: '#9E1437',
    deepMaroon: '#741127',
    gold: '#FFD33D',
    saffron: '#F2A20E',
    thread: '#FFF2A6',
    threadShadow: '#D7A824',
  },
  sage: {
    maroon: '#8F2135',
    deepMaroon: '#681A29',
    gold: '#F4C84D',
    saffron: '#E7A52B',
    thread: '#FFF1B7',
    threadShadow: '#C9A96E',
  },
};

const leftBeads = [
  { x: 118, rx: 16, ry: 8 },
  { x: 145, rx: 7, ry: 7 },
  { x: 165, rx: 13, ry: 7 },
  { x: 187, rx: 5, ry: 5 },
];

const rightBeads = leftBeads.map(({ x, rx, ry }) => ({ x: 520 - x, rx, ry }));

export default function RakhiThread({ className = '', variant = 'rose' }: RakhiThreadProps) {
  const theme = themes[variant];
  const svgId = useId().replaceAll(':', '');
  const faceGradientId = `rakhiGoldFace-${svgId}`;
  const shadowId = `rakhiMedallionShadow-${svgId}`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ filter: 'drop-shadow(0 10px 14px rgba(59,50,48,0.10))' }}
    >
      <svg width="280" height="100" viewBox="0 0 520 184" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={faceGradientId} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#FFE972" />
            <stop offset="55%" stopColor={theme.gold} />
            <stop offset="100%" stopColor={theme.saffron} />
          </radialGradient>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#7D4A10" floodOpacity="0.18" />
          </filter>
        </defs>

        <path d="M0 92H200" stroke={theme.thread} strokeWidth="9" strokeLinecap="round" />
        <path d="M320 92H520" stroke={theme.thread} strokeWidth="9" strokeLinecap="round" />
        <path d="M0 89C18 97 36 81 54 89C72 97 90 81 108 89C126 97 144 81 162 89C180 97 191 86 200 92" stroke={theme.threadShadow} strokeWidth="4" strokeLinecap="round" />
        <path d="M0 95C18 87 36 103 54 95C72 87 90 103 108 95C126 87 144 103 162 95C180 87 191 98 200 92" stroke="#FFFBE0" strokeWidth="4" strokeLinecap="round" />
        <path d="M320 92C329 86 340 97 358 89C376 81 394 97 412 89C430 81 448 97 466 89C484 81 502 97 520 89" stroke={theme.threadShadow} strokeWidth="4" strokeLinecap="round" />
        <path d="M320 92C329 98 340 87 358 95C376 103 394 87 412 95C430 103 448 87 466 95C484 103 502 87 520 95" stroke="#FFFBE0" strokeWidth="4" strokeLinecap="round" />

        {[...leftBeads, ...rightBeads].map((bead) => (
          <ellipse
            key={`${bead.x}-${bead.rx}`}
            cx={bead.x}
            cy="92"
            rx={bead.rx}
            ry={bead.ry}
            fill={theme.maroon}
            stroke={theme.gold}
            strokeWidth="3"
          />
        ))}

        {[...Array(56)].map((_, index) => {
          const angle = (index / 56) * Math.PI * 2;
          const x1 = 260 + Math.cos(angle) * 70;
          const y1 = 92 + Math.sin(angle) * 70;
          const x2 = 260 + Math.cos(angle) * 91;
          const y2 = 92 + Math.sin(angle) * 91;
          return (
            <line
              key={`ray-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={index % 2 === 0 ? theme.gold : theme.threadShadow}
              strokeWidth="1.1"
              strokeLinecap="round"
              opacity="0.48"
            />
          );
        })}

        <g filter={`url(#${shadowId})`}>
          <circle cx="260" cy="92" r="70" fill={`url(#${faceGradientId})`} />
          <circle cx="260" cy="92" r="64" fill="none" stroke="#FFE783" strokeWidth="3" />

          {[...Array(64)].map((_, index) => {
            const angle = (index / 64) * Math.PI * 2;
            const cx = 260 + Math.cos(angle) * 68;
            const cy = 92 + Math.sin(angle) * 68;
            return <circle key={`rim-${index}`} cx={cx} cy={cy} r="2.6" fill="#FFE16A" opacity="0.95" />;
          })}

          {[...Array(8)].map((_, index) => (
            <g key={`petal-${index}`} transform={`rotate(${index * 45} 260 92)`}>
              <path
                d="M260 31C278 48 281 69 260 82C239 69 242 48 260 31Z"
                fill="#FFE46C"
                stroke={theme.maroon}
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <circle cx="260" cy="69" r="7" fill={theme.maroon} opacity="0.92" />
            </g>
          ))}

          {[...Array(8)].map((_, index) => (
            <g key={`inner-petal-${index}`} transform={`rotate(${index * 45 + 22.5} 260 92)`}>
              <path
                d="M260 48C271 60 270 75 260 84C250 75 249 60 260 48Z"
                fill="#FFD94A"
                stroke={theme.deepMaroon}
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </g>
          ))}

          <circle cx="260" cy="92" r="33" fill={theme.gold} stroke={theme.deepMaroon} strokeWidth="3" />
          <circle cx="260" cy="92" r="27" fill="#FFD93E" stroke="#FFE783" strokeWidth="2" />

          {[...Array(16)].map((_, index) => (
            <g key={`flower-${index}`} transform={`rotate(${index * 22.5} 260 92)`}>
              <ellipse cx="260" cy="74" rx="4.3" ry="15" fill={theme.maroon} />
            </g>
          ))}

          <circle cx="260" cy="92" r="13" fill={theme.saffron} />
          <circle cx="260" cy="92" r="9" fill={theme.gold} />
        </g>
      </svg>
    </div>
  );
}
