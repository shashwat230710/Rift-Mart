import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * RIFT AI Conversation — Phase 4
 * Drop into: frontend/src/components/Agent/Conversation.jsx
 *
 * Usage:
 *   <Conversation
 *     initialProduct={payloadFromTerminal.product}  // string | null
 *     onComplete={({ product, budget }) => setPhase('shop-transition', { product, budget })}
 *   />
 *
 * Flow: AI greets -> asks what to buy (skipped if Terminal already captured
 * a product via "buy <product>") -> asks budget -> runs the fake multi-source
 * search animation -> hands off product + budget to Phase 5.
 */

const COLORS = {
  bg: '#050b1f',
  green: '#7ee8ff',
  amber: '#eaf2ff',
  white: '#b9d2ff',
  error: '#ff5ec4',
  blue: '#2f6bff',
};

const SEARCH_STAGES = [
  'Searching Flipkart...',
  'Searching Amazon...',
  'Comparing Prices...',
  'Checking Reviews...',
];

export default function Conversation({ initialProduct = null, onComplete = () => {} }) {
  const [entries, setEntries] = useState([]); // {type: 'ai'|'user'|'system', text}
  const [typingText, setTypingText] = useState(null); // AI line currently being typed
  const [typedChars, setTypedChars] = useState(0);
  const [queue, setQueue] = useState([]); // remaining AI lines to type
  const [awaiting, setAwaiting] = useState(null); // 'product' | 'budget' | null
  const [input, setInput] = useState('');
  const [product, setProduct] = useState(initialProduct);
  const [budget, setBudget] = useState(null);
  const [searching, setSearching] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  useEffect(() => focusInput(), [focusInput]);
  // The input is `disabled` while there's nothing to answer yet, and a
  // disabled element can't hold focus — so re-focus every time it becomes
  // enabled again, otherwise typing silently does nothing until the user
  // clicks the terminal first.
  useEffect(() => {
    if (awaiting) focusInput();
  }, [awaiting, focusInput]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries, typedChars, awaiting, input, stageIndex, progress]);

  // Kick off the opening lines once, based on whether Terminal already gave us a product
  useEffect(() => {
    const opening = initialProduct
      ? ['Hello.', `Got it — searching for "${initialProduct}".`, 'What is your budget?']
      : ['Hello.', 'What would you like to purchase today?'];
    setQueue(opening);
  }, [initialProduct]);

  // Type out queued AI lines one at a time
  useEffect(() => {
    if (typingText === null && queue.length > 0) {
      setTypingText(queue[0]);
      setTypedChars(0);
    }
  }, [queue, typingText]);

  useEffect(() => {
    if (typingText === null) return;
    if (typedChars >= typingText.length) {
      const t = setTimeout(() => {
        const finishedLine = typingText;
        setEntries((e) => [...e, { type: 'ai', text: finishedLine }]);
        setQueue((q) => q.slice(1));
        setTypingText(null);
        setTypedChars(0);

        // Decide what we're waiting for based on the line that just finished
        if (/purchase today/i.test(finishedLine)) {
          setAwaiting('product');
        } else if (/budget/i.test(finishedLine)) {
          setAwaiting('budget');
        } else if (/^Searching\.\.\.$/.test(finishedLine)) {
          setTimeout(() => setSearching(true), 400);
        }
      }, 200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedChars((c) => c + 1), 22);
    return () => clearTimeout(t);
  }, [typingText, typedChars]);

  const submitAnswer = () => {
    const value = input.trim();
    
    // If empty input, just show a new line with the prompt and return
    if (!value) {
      // Show the empty input line with the > prompt
      setEntries((e) => [...e, { type: 'user', text: '' }]);
      setInput('');
      return;
    }
    
    // If there's no awaiting state, don't process the input
    if (!awaiting) return;
    
    setEntries((e) => [...e, { type: 'user', text: value }]);
    setInput('');

    if (awaiting === 'product') {
      setProduct(value);
      setAwaiting(null);
      setQueue(['Budget?']);
    } else if (awaiting === 'budget') {
      setBudget(value);
      setAwaiting(null);
      setQueue(['Searching...']);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAnswer();
    }
  };

  // Search animation: stages
  useEffect(() => {
    if (!searching) return;
    if (stageIndex >= SEARCH_STAGES.length) return;
    const t = setTimeout(() => setStageIndex((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [searching, stageIndex]);

  // Search animation: progress bar
  useEffect(() => {
    if (!searching) return;
    if (progress >= 100) {
      if (!completed) {
        setCompleted(true);
        setTimeout(() => onComplete({ product, budget }), 600);
      }
      return;
    }
    const t = setTimeout(() => setProgress((p) => Math.min(100, p + 3 + Math.floor(Math.random() * 6))), 70);
    return () => clearTimeout(t);
  }, [searching, progress, completed, product, budget, onComplete]);

  const barLen = 20;
  const filled = Math.round((progress / 100) * barLen);
  const bar = '[' + '#'.repeat(filled) + '-'.repeat(barLen - filled) + ']';

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
        textAlign: 'left',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'text',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes crt-flicker {
          0% { opacity: 1; } 42% { opacity: 0.98; } 43% { opacity: 0.88; } 44% { opacity: 1; } 100% { opacity: 1; }
        }
        @keyframes scan-move { 0% { background-position: 0 0; } 100% { background-position: 0 8px; } }
        @keyframes cursor-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
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
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(to bottom, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px);
          animation: scan-move 0.35s linear infinite; mix-blend-mode: multiply;
        }
        .rift-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%);
        }
        .rift-flicker { animation: crt-flicker 6s infinite; }
        .rift-glow { text-shadow: 0 0 5px currentColor; }
        .rift-line { font-size: 15px; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
        .rift-cursor {
          display: inline-block; width: 9px; height: 1em; background: currentColor;
          margin-left: 2px; vertical-align: text-bottom; animation: cursor-blink 1s step-start infinite;
        }
        .rift-hidden-input { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
      `}</style>

      <div ref={scrollRef} className="rift-flicker" style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto' }}>
        <div className="rift-line rift-glow" style={{ color: COLORS.blue }}>AI&gt;</div>

        {entries.map((e, i) => {
          // Handle empty user entries (from pressing enter with no input)
          const displayText = e.type === 'user' && e.text === '' ? '> ' : e.type === 'user' ? `> ${e.text}` : e.text;
          return (
            <div
              key={i}
              className="rift-line rift-glow"
              style={{ color: e.type === 'ai' ? COLORS.green : COLORS.white, marginBottom: '4px' }}
            >
              {displayText}
            </div>
          );
        })}

        {typingText !== null && (
          <div className="rift-line rift-glow" style={{ color: COLORS.green }}>
            {typingText.slice(0, typedChars)}
            <span className="rift-cursor" style={{ background: COLORS.green }} />
          </div>
        )}

        {awaiting && (
          <div className="rift-line rift-glow" style={{ color: COLORS.white }}>
            {'> '}
            {input}
            <span className="rift-cursor" style={{ background: COLORS.white }} />
          </div>
        )}

        {searching && (
          <div style={{ marginTop: '10px' }}>
            <div className="rift-line rift-glow" style={{ color: COLORS.amber }}>
              {bar} {progress}%
            </div>
            {SEARCH_STAGES.slice(0, stageIndex).map((s, i) => (
              <div key={i} className="rift-line rift-glow" style={{ color: COLORS.green }}>
                {s}
              </div>
            ))}
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
        disabled={!awaiting}
      />

      <div className="rift-scanlines" />
      <div className="rift-vignette" />
      <div className="y2k-sheen" />
    </div>
  );
}