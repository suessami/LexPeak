// Locked brand assets: the mountain+check logomark (used as the persistent
// app icon / wordmark accent) and LexFox (used only for celebratory moments).

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="26" fill="#14274d" />
      <path d="M18 88 L52 30 L70 58 L60 88 Z" fill="#fbf6ee" opacity="0.35" />
      <path d="M34 92 L66 34 L98 92 Z" fill="#e8722c" />
      <path d="M66 34 L80 58 L72 60 L84 66 L62 66 Z" fill="#fbf6ee" opacity="0.9" />
      <path
        d="M26 78 L46 96 L94 40"
        stroke="#fbf6ee"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LexFox({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" fill="none">
      <g transform="translate(150,175)">
        <path
          d="M40 20 L118 -6 L104 -34 L128 -52 L96 -46 L86 -18 L58 4 Z"
          fill="#e8722c"
        />
        <path d="M104 -34 L120 -40 L108 -20 Z" fill="#fbf6ee" />

        <path
          d="M-52 78 L0 26 L52 78 L40 96 L-40 96 Z"
          fill="#e8722c"
        />
        <path d="M-24 96 L0 58 L24 96 Z" fill="#fbf6ee" />

        <path d="M-34 -8 L-58 -66 L-14 -34 Z" fill="#e8722c" />
        <path d="M34 -8 L58 -66 L14 -34 Z" fill="#e8722c" />
        <path d="M-30 -18 L-42 -48 L-18 -30 Z" fill="#14274d" />
        <path d="M30 -18 L42 -48 L18 -30 Z" fill="#14274d" />

        <path
          d="M-38 -6 L0 -42 L38 -6 L30 28 L0 38 L-30 28 Z"
          fill="#e8722c"
        />
        <path d="M-18 8 L0 30 L18 8 L10 26 L-10 26 Z" fill="#fbf6ee" />

        <path d="M-22 -6 L-6 -3 L-8 4 L-24 1 Z" fill="#14274d" />
        <path d="M22 -6 L6 -3 L8 4 L24 1 Z" fill="#14274d" />

        <path d="M-5 18 L5 18 L0 25 Z" fill="#14274d" />

        <path d="M-40 80 L-60 56 L-46 36 Z" fill="#e8722c" />
        <path d="M40 80 L60 56 L46 36 Z" fill="#e8722c" />

        <g transform="translate(0,58)">
          <path
            d="M-34 0 L0 -11 L34 0 L34 17 L0 6 L-34 17 Z"
            fill="#14274d"
          />
          <path d="M-34 0 L0 -11 L0 6 L-34 17 Z" fill="#1c3466" />
        </g>
      </g>
    </svg>
  );
}
