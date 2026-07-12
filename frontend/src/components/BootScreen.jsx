import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * RIFT BIOS Boot Screen — Phase 1
 * Drop into: frontend/src/components/Boot/BootScreen.jsx
 *
 * Usage:
 *   <BootScreen onComplete={() => setPhase('logo')} />
 *
 * Sequence: CRT power-on flash -> staggered BIOS check lines ->
 * loading bar to 100% -> blinking "Press Enter" prompt.
 * Press Enter (or click) to fire onComplete and move to Phase 2 (ASCII Logo).
 */

const COLORS = {
  bg: '#050b1f',
  green: '#7ee8ff',
  amber: '#eaf2ff',
  white: '#b9d2ff',
  error: '#ff5ec4',
  blue: '#2f6bff',
};

const BOOT_LINES = [
  { text: 'RIFT BIOS v0.2', color: COLORS.amber, delay: 500 },
  { text: 'Checking Memory...', color: COLORS.white, delay: 550 },
  { text: '512 MB OK', color: COLORS.green, delay: 400 },
  { text: 'Loading Kernel....', color: COLORS.white, delay: 450 },
  { text: 'Loading AI Runtime...', color: COLORS.white, delay: 450 },
  { text: 'Loading Shop Driver...', color: COLORS.white, delay: 400 },
  { text: 'Loading Payment Driver...', color: COLORS.white, delay: 400 },
  { text: 'Initializing Agent...', color: COLORS.white, delay: 500 },
  { text: 'Done.', color: COLORS.green, delay: 350 },
];

export default function BootScreen({ onComplete = () => {} }) {
  const [flash, setFlash] = useState(true);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const containerRef = useRef(null);

  // CRT power-on flash
  useEffect(() => {
    const t = setTimeout(() => setFlash(false), 200);
    return () => clearTimeout(t);
  }, []);

  // Focus container so keydown works immediately
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Stagger BIOS lines
  useEffect(() => {
    if (flash) return;
    if (visibleLines >= BOOT_LINES.length) return;
    const t = setTimeout(() => {
      setVisibleLines((v) => v + 1);
    }, BOOT_LINES[visibleLines].delay);
    return () => clearTimeout(t);
  }, [flash, visibleLines]);

  // Progress bar after all lines are in
  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) return;
    if (progress >= 100) {
      const t = setTimeout(() => setShowPrompt(true), 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setProgress((p) => Math.min(100, p + 4 + Math.floor(Math.random() * 9)));
    }, 80);
    return () => clearTimeout(t);
  }, [visibleLines, progress]);

  const advance = useCallback(() => {
    if (!showPrompt) return;
    onComplete();
  }, [showPrompt, onComplete]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') advance();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance]);

  const barWidth = 24;
  const filled = Math.round((progress / 100) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={advance}
      onKeyDown={(e) => e.key === 'Enter' && advance()}
      style={{
        background:
          'radial-gradient(circle at 30% 20%, #1b3a8a 0%, #0a1440 45%, #030714 100%)',
        color: COLORS.white,
        fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace",
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
        cursor: showPrompt ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes crt-flicker {
          0%   { opacity: 1; }
          42%  { opacity: 0.98; }
          43%  { opacity: 0.87; }
          44%  { opacity: 1; }
          70%  { opacity: 0.99; }
          71%  { opacity: 0.9; }
          72%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes scan-move {
          0%   { background-position: 0 0; }
          100% { background-position: 0 8px; }
        }
        @keyframes cursor-blink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes flash-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes sheen-sweep {
          0%   { transform: translate(-20%, -15%) rotate(12deg); }
          50%  { transform: translate(20%, 15%) rotate(12deg); }
          100% { transform: translate(-20%, -15%) rotate(12deg); }
        }
        .y2k-sheen {
          position: absolute;
          inset: -60% -60%;
          pointer-events: none;
          background: linear-gradient(
            100deg,
            transparent 42%,
            rgba(255,255,255,0.06) 48%,
            rgba(255,255,255,0.16) 50%,
            rgba(255,255,255,0.06) 52%,
            transparent 58%
          );
          animation: sheen-sweep 7s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%   { text-shadow: 0 0 4px currentColor, 0 0 8px currentColor; }
          50%  { text-shadow: 0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor; }
          100% { text-shadow: 0 0 4px currentColor, 0 0 8px currentColor; }
        }
        @keyframes glow-pulse-green {
          0%   { text-shadow: 0 0 4px ${COLORS.green}, 0 0 8px ${COLORS.green}66; }
          50%  { text-shadow: 0 0 12px ${COLORS.green}, 0 0 24px ${COLORS.green}88, 0 0 36px ${COLORS.green}44; }
          100% { text-shadow: 0 0 4px ${COLORS.green}, 0 0 8px ${COLORS.green}66; }
        }
        @keyframes glow-pulse-amber {
          0%   { text-shadow: 0 0 4px ${COLORS.amber}, 0 0 8px ${COLORS.amber}66; }
          50%  { text-shadow: 0 0 12px ${COLORS.amber}, 0 0 24px ${COLORS.amber}88, 0 0 36px ${COLORS.amber}44; }
          100% { text-shadow: 0 0 4px ${COLORS.amber}, 0 0 8px ${COLORS.amber}66; }
        }
        .rift-scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0,0,0,0.25) 0px,
            rgba(0,0,0,0.25) 1px,
            transparent 1px,
            transparent 3px
          );
          animation: scan-move 0.35s linear infinite;
          mix-blend-mode: multiply;
        }
        .rift-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%);
        }
        .rift-flicker {
          animation: crt-flicker 6s infinite;
        }
        .rift-cursor {
          display: inline-block;
          width: 10px;
          height: 1em;
          background: currentColor;
          margin-left: 8px;
          vertical-align: text-bottom;
          animation: cursor-blink 1s step-start infinite;
        }
        .boot-text {
          font-size: 18px;
          line-height: 1.7;
          text-align: left;
          width: 100%;
          max-width: 450px;
        }
        .boot-text.green {
          animation: glow-pulse-green 2.5s ease-in-out infinite;
        }
        .boot-text.amber {
          animation: glow-pulse-amber 2.5s ease-in-out infinite;
        }
        .boot-text.white {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }
        .boot-progress {
          font-size: 18px;
          line-height: 1.7;
          text-align: left;
          width: 100%;
          max-width: 450px;
          margin-top: 18px;
          letter-spacing: 1px;
          animation: glow-pulse-green 2.5s ease-in-out infinite;
        }
        .boot-prompt {
          font-size: 18px;
          margin-top: 28px;
          text-align: left;
          width: 100%;
          max-width: 450px;
          animation: glow-pulse-amber 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="rift-flicker" style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`boot-text ${line.color === COLORS.green ? 'green' : line.color === COLORS.amber ? 'amber' : 'white'}`}
              style={{ color: line.color }}
            >
              {line.text}
            </div>
          ))}

          {visibleLines >= BOOT_LINES.length && (
            <div className="boot-progress" style={{ color: COLORS.green }}>
              {bar} {progress}%
            </div>
          )}

          {showPrompt && (
            <div className="boot-prompt" style={{ color: COLORS.amber }}>
              Press Enter
              <span className="rift-cursor" style={{ background: COLORS.amber }} />
            </div>
          )}
        </div>
      </div>

      <div className="rift-scanlines" />
      <div className="rift-vignette" />
      <div className="y2k-sheen" />

      {flash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            animation: 'flash-fade 0.2s ease-out forwards',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}