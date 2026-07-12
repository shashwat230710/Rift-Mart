import React, { useEffect } from 'react';

const COLORS = {
  bg: '#050505',
  green: '#33ff66',
  white: '#ffffff',
};

export default function Receipt({ session, onComplete }) {
  const { receipt, transactionId } = session;

  useEffect(() => {
    const handleKey = () => {
      onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      style={{
        width: '100%', height: '100vh', backgroundColor: COLORS.bg,
        color: COLORS.green, fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace",
        padding: '40px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        cursor: 'pointer', overflowY: 'auto'
      }}
    >
      <style>{`
        @keyframes crt-flicker {
          0% { opacity: 1; } 42% { opacity: 0.98; } 43% { opacity: 0.88; } 44% { opacity: 1; } 100% { opacity: 1; }
        }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
      
      <div className="crt-flicker" style={{ flex: 1 }}>
        <pre style={{ color: COLORS.white, margin: 0, whiteSpace: 'pre-wrap' }}>
          {receipt || 'No receipt data available.'}
        </pre>
        
        <div style={{ marginTop: '40px', color: COLORS.green }}>
          Transaction Complete. 
        </div>
        
        <div style={{ marginTop: '20px', color: COLORS.green, animation: 'blink 1.5s infinite' }}>
          Press any key or click to finalize mission and shutdown...
        </div>
      </div>
    </div>
  );
}
