import React, { useEffect } from 'react';

const COLORS = {
  bg: '#000000',
  white: '#ffffff',
};

export default function Shutdown({ onComplete }) {
  useEffect(() => {
    // CRT power off animation timing
    const t = setTimeout(() => {
      onComplete(); // Trigger restart after shutdown sequence
    }, 2500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div style={{
      width: '100%', height: '100vh', backgroundColor: COLORS.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <style>{`
        @keyframes crt-off {
          0% { transform: scale(1, 1); opacity: 1; filter: brightness(1); }
          40% { transform: scale(1, 0.01); opacity: 1; filter: brightness(2); }
          70% { transform: scale(0.01, 0.01); opacity: 1; filter: brightness(3); }
          100% { transform: scale(0, 0); opacity: 0; filter: brightness(0); }
        }
        .shutdown-effect {
          width: 100%;
          height: 100vh;
          background-color: ${COLORS.white};
          animation: crt-off 0.8s cubic-bezier(0.8, 0, 0.2, 1) forwards;
          animation-delay: 0.5s;
        }
      `}</style>
      
      <div className="shutdown-effect" />
    </div>
  );
}
