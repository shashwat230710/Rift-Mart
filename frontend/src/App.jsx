import React, { useState } from 'react';
import BootScreen from './components/BootScreen';
import AsciiLogo from './components/AsciiLogo';
import Terminal from './components/Terminal';
import Conversation from './components/Conversation';
import ShopAgent from './components/ShopAgent';
import PaymentModule from './components/PaymentModule';
import Receipt from './components/Receipt';
import Shutdown from './components/Shutdown';

/**
 * RiftMart / AgentOS Terminal — Phase Orchestrator
 * Drop into: frontend/src/App.jsx
 *
 * State machine for the full boot -> terminal -> conversation -> shop ->
 * receipt -> shutdown experience. `session` carries data forward between
 * phases (e.g. the product Terminal captured gets passed into Conversation
 * as initialProduct; the product+budget Conversation captures gets passed
 * to Phase 5 once it's built, and so on).
 *
 * To wire in a new phase once you build it: replace its ComingSoon entry
 * in the `phases` array below with the real component, reading whatever
 * it needs from `session` and writing whatever it produces via goTo().
 */

const COLORS = {
  bg: '#050505',
  green: '#33ff66',
  amber: '#ffb000',
};

function ComingSoon({ label, onComplete }) {
  return (
    <div
      onClick={onComplete}
      style={{
        background: COLORS.bg,
        color: COLORS.green,
        fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace",
        minHeight: '480px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: '18px', letterSpacing: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: COLORS.amber, marginTop: '12px' }}>
        (click to skip — not built yet)
      </div>
    </div>
  );
}

export default function App() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [session, setSession] = useState({ product: null, budget: null });

  const goTo = (index, payload = {}) => {
    setSession((s) => ({ ...s, ...payload }));
    setPhaseIndex(index);
  };

  const restart = () => {
    setSession({ product: null, budget: null });
    setPhaseIndex(0);
  };

  // Order matters — index in this array is the phase index goTo() jumps to.
  const phases = [
    /* 0 */ () => <BootScreen onComplete={() => goTo(1)} />,
    /* 1 */ () => <AsciiLogo onComplete={() => goTo(2)} />,
    /* 2 */ () => <Terminal onComplete={(payload) => goTo(3, payload)} />,
    /* 3 */ () => (
      <Conversation
        initialProduct={session.product}
        onComplete={(payload) => goTo(4, payload)}
      />
    ),
    /* 4 */ () => (
      <ShopAgent session={session} onComplete={(payload) => goTo(5, payload)} />
    ),
    /* 5 */ () => (
      <PaymentModule session={session} onComplete={(payload) => goTo(6, payload)} />
    ),
    /* 6 */ () => <Receipt session={session} onComplete={() => goTo(7)} />,
    /* 7 */ () => <Shutdown onComplete={restart} />,
  ];

  return <div style={{ width: '100%' }}>{phases[phaseIndex]()}</div>;
}
