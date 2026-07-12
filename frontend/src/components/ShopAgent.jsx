import React, { useState, useEffect, useRef } from 'react';

const XP_COLORS = {
  windowBg: '#ece9d8',
  titleBarBlue1: '#0058e6',
  titleBarBlue2: '#3a93ff',
  titleBarBlue3: '#288eff',
  titleBarBlue4: '#127dff',
  titleBarBlue5: '#0366e3',
  buttonRed: '#e81123',
  borderDark: '#00138c',
  panelBg: '#ffffff',
  text: '#000000',
  agentGreen: '#33ff66',
  agentBg: '#050505',
};

const AGENT_STEPS = [
  { label: 'Initializing Shopping Agent...', delay: 1500, state: 'init' },
  { label: 'Opening Shop.exe...', delay: 1000, state: 'open' },
  { label: 'Searching catalog...', delay: 2000, state: 'search' },
  { label: 'Evaluating products...', delay: 2500, state: 'eval' },
  { label: 'Comparing prices...', delay: 2000, state: 'price' },
  { label: 'Reading reviews...', delay: 2500, state: 'review' },
  { label: 'Selecting best option...', delay: 2000, state: 'select' },
  { label: 'Opening product...', delay: 1500, state: 'product' },
  { label: 'Adding to cart...', delay: 1500, state: 'cart' },
  { label: 'Proceeding to checkout...', delay: 2000, state: 'checkout' },
  { label: 'Waiting for Payment Module...', delay: 2000, state: 'handoff' }
];

export default function ShopAgent({ session, onComplete }) {
  const { product, budget } = session;
  const numBudget = parseFloat(budget) || 1000;
  
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  
  // Simulated State for the UI
  const [uiState, setUiState] = useState('init'); // init, open, search, eval, price, review, select, product, cart, checkout
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Expense Tracking
  const [expense, setExpense] = useState({
    budget: numBudget,
    price: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    remaining: numBudget
  });

  const logsEndRef = useRef(null);

  // Generate fixed catalogue of products
  const [fakeProducts] = useState(() => {
    return [
      { id: 1, name: `Computer Mouse - Basic Model`, price: 25.00, rating: 3.5, reviews: 200, image: '/mouse_basic.png' },
      { id: 2, name: `Computer Mouse - Pro Edition`, price: 65.00, rating: 4.2, reviews: 800, image: '/mouse_pro.png' },
      { id: 3, name: `Computer Mouse - Premium Ultra`, price: 115.00, rating: 4.8, reviews: 1000, image: '/mouse_premium.png' },
      { id: 4, name: `Computer Mouse - Lite Version`, price: 15.00, rating: 2.5, reviews: 100, image: '/mouse_lite.png' },
      { id: 5, name: `Retro Mechanical Keyboard`, price: 150.00, rating: 4.8, reviews: 1200, image: '/keyboard.png' },
      { id: 6, name: `CRT Monitor 19"`, price: 250.00, rating: 4.2, reviews: 340, image: '/monitor.png' },
      { id: 7, name: `Silver WebCam 480p`, price: 45.00, rating: 3.5, reviews: 150, image: '/webcam.png' },
      { id: 8, name: `Multimedia Headset`, price: 30.00, rating: 4.0, reviews: 500, image: '/headset.png' },
    ];
  });

  // AI Logic: dynamically evaluate products to find the best option within budget
  const bestProduct = fakeProducts
    .filter(p => p.price <= numBudget && p.name.toLowerCase().includes(product.toLowerCase()))
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)[0] || fakeProducts[0];

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (stepIndex >= AGENT_STEPS.length) {
      // Handoff to next phase
      const finalOrder = {
        product: selectedProduct,
        expense,
        taskId: `TASK-${Math.floor(Math.random() * 100000)}`
      };
      onComplete(finalOrder);
      return;
    }

    const step = AGENT_STEPS[stepIndex];
    
    // Add log
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => [...prev, { time: timeStr, text: step.label }]);
    setUiState(step.state);

    // Apply side effects of certain steps
    if (step.state === 'select') {
      setSelectedProduct(bestProduct);
    } else if (step.state === 'cart') {
      const price = bestProduct.price;
      const discount = price * 0.1; // 10% discount
      const shipping = 15.0;
      const total = price - discount + shipping;
      setExpense({
        budget: numBudget,
        price,
        discount,
        shipping,
        total,
        remaining: numBudget - total
      });
    }

    const timer = setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  // UI Renderers
  const renderBrowserContent = () => {
    if (uiState === 'init' || uiState === 'open') {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <h2>Welcome to Shop.exe</h2>
          <p>Waiting for AgentOS Commands...</p>
        </div>
      );
    }

    if (['search', 'eval', 'price', 'review', 'select'].includes(uiState)) {
      const displayProducts = fakeProducts.filter(p => p.name.toLowerCase().includes(product.toLowerCase()));
      const productsToShow = displayProducts.length > 0 ? displayProducts : fakeProducts; // fallback if no match

      return (
        <div style={{ padding: '20px' }}>
          <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
            Search Results for: "{product}"
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            {productsToShow.map(p => (
              <div key={p.id} className={uiState === 'select' && selectedProduct?.id === p.id ? 'ai-click-effect' : ''} style={{ 
                border: uiState === 'select' && selectedProduct?.id === p.id ? '3px solid #0058e6' : '1px solid #ccc',
                backgroundColor: uiState === 'select' && selectedProduct?.id === p.id ? '#e6f0ff' : '#fff',
                padding: '15px',
                borderRadius: '5px',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', height: '34px', overflow: 'hidden' }}>{p.name}</h4>
                <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', backgroundColor: '#fff' }}>
                  <img src={p.image} alt={p.name} style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b12704' }}>
                  ${p.price.toFixed(2)}
                </div>
                {['review', 'select'].includes(uiState) && (
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
                    Rating: {p.rating} / 5.0 ({p.reviews} reviews)
                  </div>
                )}
                {['eval', 'price', 'review', 'select'].includes(uiState) && uiState !== 'search' && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: p.price <= numBudget ? 'green' : 'red' }}>
                    {p.price <= numBudget ? 'Within Budget' : 'Exceeds Budget'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (['product', 'cart', 'checkout', 'handoff'].includes(uiState)) {
      if (!selectedProduct) return null;
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, backgroundColor: '#fff', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', overflow: 'hidden', padding: '10px' }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 2 }}>
              <h2 style={{ marginTop: 0 }}>{selectedProduct.name}</h2>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b12704', marginBottom: '15px' }}>
                ${selectedProduct.price.toFixed(2)}
              </div>
              <p style={{ color: '#007185', fontWeight: 'bold' }}>In Stock.</p>
              
              {uiState === 'cart' || uiState === 'checkout' || uiState === 'handoff' ? (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3f3f3', border: '1px solid #ddd' }}>
                  <h3 style={{ marginTop: 0, color: '#333' }}>Shopping Cart</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>Items (1):</span>
                    <span>${expense.price.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: 'green' }}>
                    <span>Discount applied:</span>
                    <span>-${expense.discount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>Shipping:</span>
                    <span>${expense.shipping.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#b12704' }}>
                    <span>Order Total:</span>
                    <span>${expense.total.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <button className={uiState === 'product' ? 'ai-click-effect' : ''} style={{ 
                  marginTop: '20px', 
                  padding: '10px 20px', 
                  backgroundColor: '#ffd814', 
                  border: '1px solid #fcd200', 
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  Add to Cart
                </button>
              )}
            </div>
          </div>
          
          {(uiState === 'checkout' || uiState === 'handoff') && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button className={uiState === 'checkout' ? 'ai-click-effect' : ''} style={{
                padding: '12px 30px',
                backgroundColor: '#ffa41c',
                border: '1px solid #ff8f00',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Proceed to Checkout
              </button>
              {uiState === 'handoff' && (
                <div style={{ marginTop: '15px', color: '#0058e6', fontWeight: 'bold' }}>
                  Handing off to Payment Module...
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes ai-click {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(51, 255, 102, 0); }
          50% { transform: scale(0.95); background-color: rgba(51, 255, 102, 0.5); box-shadow: 0 0 20px rgba(51, 255, 102, 0.8); }
          100% { transform: scale(1); box-shadow: 0 0 0 rgba(51, 255, 102, 0); }
        }
        .ai-click-effect {
          animation: ai-click 0.5s ease-in-out forwards;
          animation-delay: 1s;
        }
      `}</style>
      {/* Container holding both Agent Terminal and Shop.exe */}
      <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '1200px', height: '600px' }}>
        
        {/* Agent Terminal Window */}
        <div style={{ 
          width: '350px', 
          backgroundColor: XP_COLORS.agentBg, 
          border: `2px solid ${XP_COLORS.agentGreen}`,
          borderRadius: '5px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 15px rgba(51, 255, 102, 0.2)',
          fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace"
        }}>
          <div style={{ 
            backgroundColor: XP_COLORS.agentGreen, 
            color: '#000', 
            padding: '5px 10px', 
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>AGENT_OS_CORE.exe</span>
            <span>[AUTO]</span>
          </div>
          
          <div style={{ padding: '15px', flex: 1, overflowY: 'auto', color: XP_COLORS.agentGreen, fontSize: '13px' }}>
            <div style={{ marginBottom: '15px', borderBottom: `1px dashed ${XP_COLORS.agentGreen}`, paddingBottom: '10px' }}>
              MISSION PARAMETERS:<br/>
              &gt; PRODUCT: {product}<br/>
              &gt; BUDGET: ${numBudget.toFixed(2)}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ wordBreak: 'break-word' }}>
                  <span style={{ opacity: 0.7 }}>[{log.time}]</span> {log.text}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            
            {stepIndex < AGENT_STEPS.length && (
              <div style={{ marginTop: '10px', animation: 'blink 1s infinite' }}>
                <style>{`@keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }`}</style>
                _
              </div>
            )}
          </div>
          
          {/* Expense Tracking Panel */}
          {expense.price > 0 && (
            <div style={{ 
              borderTop: `1px solid ${XP_COLORS.agentGreen}`, 
              padding: '10px', 
              fontSize: '12px',
              color: XP_COLORS.agentGreen 
            }}>
              <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>EXPENSE TRACKING</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>BUDGET:</span><span>${expense.budget.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SELECTED:</span><span>${expense.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>REMAINING:</span><span>${expense.remaining.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Shop.exe Windows XP Window */}
        <div style={{
          flex: 1,
          backgroundColor: XP_COLORS.windowBg,
          border: `1px solid ${XP_COLORS.borderDark}`,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '5px 5px 15px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          fontFamily: "'Tahoma', 'Segoe UI', sans-serif"
        }}>
          {/* Windows XP Title Bar */}
          <div style={{
            background: `linear-gradient(to bottom, ${XP_COLORS.titleBarBlue1} 0%, ${XP_COLORS.titleBarBlue2} 8%, ${XP_COLORS.titleBarBlue3} 40%, ${XP_COLORS.titleBarBlue4} 88%, ${XP_COLORS.titleBarBlue5} 100%)`,
            padding: '3px 5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '30px'
          }}>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px', textShadow: '1px 1px 2px #000', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🛒</span> Shop.exe - Internet Explorer
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button style={{ width: '22px', height: '22px', background: '#fff', border: '1px solid #000', borderRadius: '3px', fontWeight: 'bold', lineHeight: '10px', cursor: 'pointer' }}>_</button>
              <button style={{ width: '22px', height: '22px', background: '#fff', border: '1px solid #000', borderRadius: '3px', fontWeight: 'bold', lineHeight: '10px', cursor: 'pointer' }}>□</button>
              <button style={{ width: '22px', height: '22px', background: XP_COLORS.buttonRed, color: 'white', border: '1px solid #fff', borderRadius: '3px', fontWeight: 'bold', lineHeight: '10px', cursor: 'pointer' }}>X</button>
            </div>
          </div>
          
          {/* Windows XP Toolbars */}
          <div style={{ backgroundColor: '#efebe3', borderBottom: '1px solid #ccc', padding: '5px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '12px', marginBottom: '5px' }}>
              <span style={{ cursor: 'pointer' }}><u>F</u>ile</span>
              <span style={{ cursor: 'pointer' }}><u>E</u>dit</span>
              <span style={{ cursor: 'pointer' }}><u>V</u>iew</span>
              <span style={{ cursor: 'pointer' }}>F<u>a</u>vorites</span>
              <span style={{ cursor: 'pointer' }}><u>T</u>ools</span>
              <span style={{ cursor: 'pointer' }}><u>H</u>elp</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '5px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                <span style={{ color: '#aaa', fontSize: '20px' }}>⇦</span>
                <span style={{ color: '#aaa', fontSize: '20px' }}>⇨</span>
                <span style={{ fontSize: '16px' }}>✖</span>
                <span style={{ fontSize: '16px' }}>🏠</span>
              </div>
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '12px' }}>Address</span>
                <div style={{ flex: 1, background: '#fff', border: '1px solid #7f9db9', padding: '2px 5px', fontSize: '12px' }}>
                  http://www.riftmart.shop/search?q={encodeURIComponent(product)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Web Content Area */}
          <div style={{ flex: 1, backgroundColor: XP_COLORS.panelBg, overflowY: 'auto', position: 'relative' }}>
            {renderBrowserContent()}
          </div>
          
          {/* Windows XP Status Bar */}
          <div style={{
            height: '22px',
            backgroundColor: '#efebe3',
            borderTop: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            fontSize: '11px',
            color: '#333'
          }}>
            <div style={{ flex: 1 }}>Done</div>
            <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Internet 🌐
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
