import React from 'react';

export function BrandLogo({ className = 'w-9 h-9', size = 'default' }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-black border border-orange-500/30 shadow-lg shadow-orange-500/20 overflow-hidden flex-shrink-0 group ${className}`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/45 via-orange-600/25 to-amber-400/25 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* SVG Vector Icon */}
      <svg
        viewBox="0 0 48 48"
        className="w-[72%] h-[72%] relative z-10 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="logo-core-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Outer Shield Shell */}
        <path
          d="M24 6 L38 11 C38 23 30 35 24 40 C18 35 10 23 10 11 Z"
          fill="url(#logo-shield-grad)"
          fillOpacity="0.25"
          stroke="url(#logo-shield-grad)"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Isometric Neural Core Geometry */}
        <path
          d="M24 13 L32 18 L24 23 L16 18 Z"
          fill="url(#logo-core-grad)"
          fillOpacity="0.7"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M16 18 L16 27 L24 32 L24 23 Z"
          fill="#f97316"
          fillOpacity="0.8"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M32 18 L32 27 L24 32 L24 23 Z"
          fill="#c2410c"
          fillOpacity="0.9"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Central Pulse Point */}
        <circle cx="24" cy="23" r="2.2" fill="#ffffff" />
      </svg>
    </div>
  );
}
