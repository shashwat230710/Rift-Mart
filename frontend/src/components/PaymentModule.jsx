import React, { useState, useEffect } from 'react';

const COLORS = {
  bg: '#050505',
  green: '#33ff66',
  error: '#ff1111',
  white: '#ffffff',
  blue: '#3a93ff',
};

export default function PaymentModule({ session, onComplete }) {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('initializing'); // initializing, processing, success, error
  const [authRequired, setAuthRequired] = useState(false);
  const [password, setPassword] = useState('');
  const authResolveRef = React.useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const runPayment = async () => {
      const addLog = (text, color = COLORS.green) => {
        if (isMounted) setLogs(prev => [...prev, { text, color }]);
      };

      try {
        await new Promise(r => setTimeout(r, 1000));
        addLog('INITIATING AI-PAY PROTOCOL v1.0...', COLORS.white);
        
        await new Promise(r => setTimeout(r, 1200));
        const productName = session.product?.name || 'Unknown Product';
        const amount = session.expense?.total || 0;
        
        addLog(`> TARGET: ${productName}`, COLORS.blue);
        addLog(`> AMOUNT: $${amount.toFixed(2)}`, COLORS.blue);
        
        await new Promise(r => setTimeout(r, 1500));
        addLog('SECURITY CLEARANCE REQUIRED. AWAITING PIN...', COLORS.error);
        
        setAuthRequired(true);
        const submittedPin = await new Promise(r => { authResolveRef.current = r; });
        setAuthRequired(false);
        
        if (submittedPin !== '1234') {
          addLog('[FATAL] INVALID PIN. TRANSACTION ABORTED.', COLORS.error);
          if (isMounted) setStatus('error');
          return;
        }
        
        addLog('[OK] SECURITY CLEARANCE GRANTED.', COLORS.green);
        
        await new Promise(r => setTimeout(r, 1500));
        addLog('Connecting to payment gateway (localhost:5000)...');
        
        // Ensure balance is sufficient (Optional demo hack: add funds first)
        try {
          await fetch('http://localhost:5000/wallet/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount + 100 })
          });
        } catch(e) {
          // ignore error if it fails
        }
        
        const response = await fetch('http://localhost:5000/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: String(session.product?.id || '000'),
            productName: productName,
            amount: amount,
            agentId: session.taskId || 'AGENT-OS'
          })
        });
        
        const data = await response.json();
        
        if (data.status === 'SUCCESS') {
          await new Promise(r => setTimeout(r, 1000));
          addLog(`[OK] PAYMENT AUTHORIZED`, COLORS.green);
          addLog(`TRANSACTION ID: ${data.transactionId}`, COLORS.white);
          
          await new Promise(r => setTimeout(r, 1500));
          addLog(`Retrieving digital receipt...`);
          
          await new Promise(r => setTimeout(r, 1000));
          if (isMounted) setStatus('success');
          
          setTimeout(() => {
            if (isMounted) onComplete({ receipt: data.receipt, transactionId: data.transactionId });
          }, 2000);
          
        } else {
          addLog(`[ERROR] PAYMENT FAILED: ${data.error || 'Unknown error'}`, COLORS.error);
          if (isMounted) setStatus('error');
        }
      } catch (err) {
        addLog(`[FATAL] CONNECTION REFUSED. Is the backend running on port 5000?`, COLORS.error);
        if (isMounted) setStatus('error');
      }
    };
    
    runPayment();
    
    return () => { isMounted = false; };
  }, [session, onComplete]);

  return (
    <div style={{
      width: '100%', height: '100vh', backgroundColor: COLORS.bg,
      color: COLORS.green, fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace",
      padding: '40px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
      `}</style>
      
      <div style={{ borderBottom: `2px solid ${COLORS.green}`, paddingBottom: '10px', marginBottom: '20px', fontSize: '24px' }}>
        AI-PAY PROTOCOL
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ color: log.color }}>
            {log.text}
          </div>
        ))}
        {status === 'initializing' && !authRequired && (
          <div style={{ animation: 'pulse 1s infinite' }}>_</div>
        )}
        {authRequired && (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password) {
              if (authResolveRef.current) authResolveRef.current(password);
            }
          }} style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
            <span style={{ color: COLORS.error }}>PIN (1234):</span>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                backgroundColor: COLORS.bg,
                border: `1px solid ${COLORS.error}`,
                color: COLORS.error,
                fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace",
                outline: 'none',
                padding: '2px 5px',
                width: '150px'
              }}
            />
            <button type="submit" style={{
              backgroundColor: COLORS.error,
              color: COLORS.bg,
              border: 'none',
              fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace",
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '2px 10px'
            }}>AUTHORIZE</button>
          </form>
        )}
        {status === 'error' && (
          <div style={{ color: COLORS.error, marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.location.reload()}>
            [REBOOT SYSTEM]
          </div>
        )}
      </div>
    </div>
  );
}
