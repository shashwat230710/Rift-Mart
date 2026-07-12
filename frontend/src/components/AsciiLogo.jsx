import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * RIFT ASCII Logo — Phase 2
 * Drop into: frontend/src/components/Ascii/AsciiLogo.jsx
 *
 * Usage:
 *   <AsciiLogo onComplete={() => setPhase('terminal')} />
 *
 * Sequence: logo glitches in (red/blue channel split settling to green) ->
 * subtitle types out line by line -> blinking "Press Enter" prompt.
 */

const COLORS = {
  bg: '#050b1f',
  green: '#7ee8ff',
  amber: '#eaf2ff',
  white: '#b9d2ff',
  error: '#ff5ec4',
  blue: '#2f6bff',
};

const ASCII_RIFT = `
   ██████╗  ██╗ ███████╗ ████████╗     ███╗   ███╗ █████╗ ██████╗ ████████╗
   ██╔══██╗ ██║ ██╔════╝ ╚══██╔══╝     ████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝
   ██████╔╝ ██║ █████╗      ██║        ██╔████╔██║███████║██████╔╝   ██║   
   ██╔══██╗ ██║ ██╔══╝      ██║        ██║╚██╔╝██║██╔══██║██╔══██╗   ██║   
   ██║  ██║ ██║ ██║         ██║        ██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   
   ╚═╝  ╚═╝ ╚═╝ ╚═╝         ╚═╝        ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
`;

const SUBTITLE_LINES = ['AI Powered Shopping OS', 'Version 0.1.0'];

export default function AsciiLogo({ onComplete = () => {} }) {
  const [settled, setSettled] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const containerRef = useRef(null);

  // Glitch-in resolves after ~650ms
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 650);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Typewriter through subtitle lines
  useEffect(() => {
    if (!settled) return;
    if (lineIndex >= SUBTITLE_LINES.length) {
      const t = setTimeout(() => setShowPrompt(true), 300);
      return () => clearTimeout(t);
    }
    const current = SUBTITLE_LINES[lineIndex];
    if (charIndex >= current.length) {
      const t = setTimeout(() => {
        setLineIndex((l) => l + 1);
        setCharIndex(0);
      }, 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCharIndex((c) => c + 1), 28);
    return () => clearTimeout(t);
  }, [settled, lineIndex, charIndex]);

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

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={advance}
      onKeyDown={(e) => e.key === 'Enter' && advance()}
      style={{
        background: 'radial-gradient(circle at 30% 20%, #1b3a8a 0%, #0a1440 45%, #030714 100%)',
        color: COLORS.white,
        fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace",
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
        cursor: showPrompt ? 'pointer' : 'default',
        userSelect: 'none',
        textAlign: 'center',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes rift-glitch-in {
          0%   { opacity: 0; transform: scale(0.94); text-shadow: -3px 0 ${COLORS.error}, 3px 0 ${COLORS.blue}; }
          15%  { opacity: 1; transform: scale(1.01); text-shadow: 3px 0 ${COLORS.error}, -3px 0 ${COLORS.blue}; }
          30%  { text-shadow: -2px 0 ${COLORS.error}, 2px 0 ${COLORS.blue}; }
          45%  { text-shadow: 2px 0 ${COLORS.blue}, -2px 0 ${COLORS.error}; }
          60%  { text-shadow: -1px 0 ${COLORS.error}, 1px 0 ${COLORS.blue}; }
          80%  { transform: scale(1); text-shadow: 0 0 8px ${COLORS.green}; }
          100% { opacity: 1; transform: scale(1); text-shadow: 0 0 8px ${COLORS.green}; }
        }

        @keyframes rift-breathe {
          0%   { text-shadow: 0 0 6px ${COLORS.green}, 0 0 12px ${COLORS.green}33; }
          50%  { text-shadow: 0 0 16px ${COLORS.green}, 0 0 32px ${COLORS.green}44, 0 0 48px ${COLORS.green}22; }
          100% { text-shadow: 0 0 6px ${COLORS.green}, 0 0 12px ${COLORS.green}33; }
        }

        @keyframes rift-breathe-amber {
          0%   { text-shadow: 0 0 4px ${COLORS.amber}, 0 0 8px ${COLORS.amber}33; }
          50%  { text-shadow: 0 0 12px ${COLORS.amber}, 0 0 24px ${COLORS.amber}44, 0 0 36px ${COLORS.amber}22; }
          100% { text-shadow: 0 0 4px ${COLORS.amber}, 0 0 8px ${COLORS.amber}33; }
        }

        @keyframes crt-flicker {
          0%   { opacity: 1; }
          42%  { opacity: 0.98; }
          43%  { opacity: 0.88; }
          44%  { opacity: 1; }
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
        .rift-logo-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .rift-logo {
          font-size: 15px;
          line-height: 1.15;
          white-space: pre;
          color: ${COLORS.green};
          display: inline-block;
          text-align: left;
          padding-left: 20px;
        }
        .rift-logo.glitch-active {
          animation: rift-glitch-in 0.65s ease-out forwards;
        }
        .rift-logo.breathe-active {
          animation: rift-breathe 3s ease-in-out infinite;
        }
        .rift-subtitle {
          transition: text-shadow 0.3s ease;
        }
        .rift-subtitle.breathe-active {
          animation: rift-breathe-amber 3s ease-in-out infinite;
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
        .rift-flicker { animation: crt-flicker 6s infinite; }
        .rift-cursor {
          display: inline-block;
          width: 10px;
          height: 1em;
          background: currentColor;
          margin-left: 8px;
          vertical-align: text-bottom;
          animation: cursor-blink 1s step-start infinite;
        }
      `}</style>

      <div className="rift-flicker" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="rift-logo-wrapper">
          <pre 
            className={`rift-logo ${settled ? 'breathe-active' : 'glitch-active'}`}
          >
            {ASCII_RIFT}
          </pre>
        </div>

        <div style={{ marginTop: '24px', minHeight: '48px' }}>
          {SUBTITLE_LINES.map((line, i) => {
            if (i > lineIndex) return null;
            const text = i === lineIndex ? line.slice(0, charIndex) : line;
            const isComplete = i < lineIndex || (i === lineIndex && charIndex >= line.length);
            return (
              <div
                key={i}
                className={`rift-subtitle ${settled && isComplete ? 'breathe-active' : ''}`}
                style={{
                  color: i === 0 ? COLORS.white : COLORS.amber,
                  fontSize: '15px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  lineHeight: 1.8,
                }}
              >
                {text}
                {i === lineIndex && charIndex < line.length && (
                  <span className="rift-cursor" style={{ background: COLORS.white }} />
                )}
              </div>
            );
          })}
        </div>

        {showPrompt && (
          <div
            className="rift-subtitle breathe-active"
            style={{
              color: COLORS.amber,
              fontSize: '16px',
              marginTop: '20px',
            }}
          >
            Press Enter
            <span className="rift-cursor" style={{ background: COLORS.amber }} />
          </div>
        )}
      </div>

      <div className="rift-scanlines" />
      <div className="rift-vignette" />
      <div className="y2k-sheen" />
    </div>
  );
}