import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * RIFT Command Line — Phase 3
 * Drop into: frontend/src/components/Terminal/Terminal.jsx
 *
 * Usage:
 *   <Terminal onComplete={(payload) => setPhase('conversation', payload)} />
 *
 * This is the first real interactive phase: a live command line with a
 * hidden <input> capturing real keystrokes (so mobile keyboards + paste +
 * backspace all just work) rendered as a retro block-cursor terminal line.
 *
 * Built-in commands: help, buy [product], clear, version, about, history,
 * restart, exit. Typing "buy" (with or without a product name) calls
 * onComplete({ product }) to hand off to Phase 4 (AI Conversation).
 */

const COLORS = {
  bg: '#050b1f',
  green: '#7ee8ff',
  amber: '#eaf2ff',
  white: '#b9d2ff',
  error: '#ff5ec4',
  blue: '#2f6bff',
};

const PROMPT = 'RIFT>';

const HELP_TEXT = [
  'help      show this list',
  'buy       start a purchase (e.g. "buy gaming mouse")',
  'clear     clear the screen',
  'version   show RIFT OS version',
  'about     about this terminal',
  'history   show command history',
  'restart   clear session',
  'exit      end session',
];

const MINI_LOGO = `
  ██████╗ ██╗███████╗████████╗     ███╗   ███╗ █████╗ ██████╗ ████████╗
  ██╔══██╗██║██╔════╝╚══██╔══╝     ████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝
  ██████╔╝██║█████╗     ██║        ██╔████╔██║███████║██████╔╝   ██║   
  ██╔══██╗██║██╔══╝     ██║        ██║╚██╔╝██║██╔══██║██╔══██╗   ██║   
  ██║  ██║██║██║        ██║        ██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   
  ╚═╝  ╚═╝╚═╝╚═╝        ╚═╝        ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
`;

const INTRO_LINES = ["RIFT OS v0.1.0 — Terminal Ready.", "Type 'help' to see available commands."];

export default function Terminal({ onComplete = () => {} }) {
  const [introShown, setIntroShown] = useState(0);
  const [logoShown, setLogoShown] = useState(false);
  const [lines, setLines] = useState([]); // {type: 'input' | 'output' | 'error', text}
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (introShown >= INTRO_LINES.length) return;
    const t = setTimeout(() => setIntroShown((n) => n + 1), 450);
    return () => clearTimeout(t);
  }, [introShown]);

  // Show logo after the first intro line appears
  useEffect(() => {
    if (introShown >= 1 && !logoShown) {
      setLogoShown(true);
    }
  }, [introShown, logoShown]);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, introShown, input]);

  const pushLine = (type, text) => setLines((l) => [...l, { type, text }]);

  const runCommand = (raw) => {
    const trimmed = raw.trim();
    
    // Always show the input line
    pushLine('input', `${PROMPT} ${trimmed}`);
    
    // If empty command, just show a new blank line
    if (!trimmed) {
      return;
    }

    const [cmd, ...rest] = trimmed.split(/\s+/);
    const arg = rest.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        HELP_TEXT.forEach((h) => pushLine('output', h));
        break;
      case 'version':
        pushLine('output', 'RIFT OS v0.1.0');
        break;
      case 'about':
        pushLine('output', 'RiftMart — AI powered shopping terminal.');
        break;
      case 'history':
        if (history.length === 0) {
          pushLine('output', 'No commands yet.');
        } else {
          history.forEach((h, i) => pushLine('output', `${i + 1}  ${h}`));
        }
        break;
      case 'clear':
        setLines([]);
        return;
      case 'restart':
        setLines([]);
        pushLine('output', 'Session cleared.');
        break;
      case 'exit':
        pushLine('output', 'Session terminated.');
        break;
      case 'buy':
        pushLine('output', arg ? `Starting purchase: ${arg}` : 'Starting purchase...');
        setTimeout(() => onComplete({ product: arg || null }), 500);
        break;
      default:
        pushLine('error', `'${cmd}' is not recognized. Type 'help' for options.`);
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    
    // Add to history only if it's not empty
    if (trimmed) {
      setHistory((h) => [...h, trimmed]);
    }
    
    setHistoryPointer(null);
    runCommand(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextPointer = historyPointer === null ? history.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setInput(history[nextPointer]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === null) return;
      const nextPointer = historyPointer + 1;
      if (nextPointer >= history.length) {
        setHistoryPointer(null);
        setInput('');
      } else {
        setHistoryPointer(nextPointer);
        setInput(history[nextPointer]);
      }
    }
  };

  const lineColor = (type) => {
    if (type === 'input') return COLORS.white;
    if (type === 'error') return COLORS.error;
    return COLORS.green;
  };

  return (
    <div
      onClick={focusInput}
      style={{
        background: 'radial-gradient(circle at 30% 20%, #1b3a8a 0%, #0a1440 45%, #030714 100%)',
        color: COLORS.white,
        fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace",
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px',
        paddingTop: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'text',
        userSelect: 'text',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=JetBrains+Mono:wght@400;700&display=swap');

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
        @keyframes logo-fade-in {
          0%   { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes logo-glow-pulse {
          0%   { text-shadow: 0 0 4px ${COLORS.green}, 0 0 8px ${COLORS.green}44; }
          50%  { text-shadow: 0 0 12px ${COLORS.green}, 0 0 24px ${COLORS.green}66, 0 0 36px ${COLORS.green}33; }
          100% { text-shadow: 0 0 4px ${COLORS.green}, 0 0 8px ${COLORS.green}44; }
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
        .rift-block-cursor {
          display: inline-block;
          width: 9px;
          height: 1em;
          background: ${COLORS.green};
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: cursor-blink 1s step-start infinite;
        }
        .rift-hidden-input {
          position: absolute;
          opacity: 0;
          width: 1px;
          height: 1px;
          pointer-events: none;
        }
        .rift-line {
          font-size: 15px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
          text-align: left;
          width: 100%;
        }
        .rift-mini-logo {
          font-size: 8px;
          line-height: 1.2;
          white-space: pre;
          color: ${COLORS.green};
          opacity: 0;
          animation: logo-fade-in 0.8s ease-out forwards, logo-glow-pulse 3s ease-in-out infinite 0.8s;
          text-align: left;
          margin-bottom: 6px;
        }
        .rift-intro-line {
          font-size: 15px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
          text-align: left;
          width: 100%;
          color: ${COLORS.amber};
        }
      `}</style>

      <div
        ref={scrollRef}
        className="rift-flicker"
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {logoShown && (
          <div className="rift-mini-logo">
            {MINI_LOGO}
          </div>
        )}

        {INTRO_LINES.slice(0, introShown).map((t, i) => (
          <div key={`intro-${i}`} className="rift-intro-line">
            {t}
          </div>
        ))}

        {lines.map((l, i) => (
          <div key={i} className="rift-line" style={{ color: lineColor(l.type) }}>
            {l.text}
          </div>
        ))}

        {introShown >= INTRO_LINES.length && (
          <div className="rift-line" style={{ color: COLORS.white }}>
            {PROMPT} {input}
            <span className="rift-block-cursor" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        className="rift-hidden-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        spellCheck={false}
        autoComplete="off"
      />

      <div className="rift-scanlines" />
      <div className="rift-vignette" />
      <div className="y2k-sheen" />
    </div>
  );
}