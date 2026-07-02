(function() {
  try {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent === 'accepted' || storedConsent === 'declined') return;
  } catch (err) {
    console.warn('Cookie banner could not access localStorage:', err);
  }

  const style = document.createElement('style');
  style.textContent = `
    .cookie-banner {
      position: fixed;
      bottom: 24px;
      left: 24px;
      width: calc(100% - 48px);
      max-width: 380px;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 12px;
      padding: 20px 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 100000;
      box-shadow: 0 12px 40px rgba(0,0,0,0.08);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s ease, background 0.3s, border-color 0.3s, color 0.3s;
    }
    .cookie-banner.show { transform: translateY(0); opacity: 1; }
    .cookie-title { font-weight: 600; font-size: 15px; margin: 0; }
    .cookie-text { font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0; }
    .cookie-actions {
      display: flex;
      gap: 10px;
      margin-top: 4px;
      flex-wrap: wrap;
    }
    .cookie-btn {
      border: none;
      border-radius: 8px;
      padding: 10px 14px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      flex: 1 1 0;
      min-width: 110px;
    }
    .cookie-btn-accept {
      background: linear-gradient(135deg, #4D61FF, #9D50FF);
      color: #fff;
    }
    .cookie-btn-decline {
      background: var(--bg-soft);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .cookie-close-x {
      position: absolute; top: 12px; right: 12px;
      background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer;
    }
    @media (max-width: 480px) {
      .cookie-banner { left: 16px; width: calc(100% - 32px); }
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <button class="cookie-close-x" id="btn-close-x" aria-label="Close">✕</button>
    <p class="cookie-title">We use cookies</p>
    <p class="cookie-text">We use cookies to improve your experience on this site.</p>
    <div class="cookie-actions">
      <button class="cookie-btn cookie-btn-decline" id="btn-decline-cookies">Don't allow</button>
      <button class="cookie-btn cookie-btn-accept" id="btn-accept-cookies">Allow cookies</button>
    </div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 1500);

  const hide = () => { banner.classList.remove('show'); setTimeout(() => banner.remove(), 400); };
  
  const saveConsent = (val) => {
    try {
      localStorage.setItem('cookieConsent', val);
    } catch (e) {
      console.warn('LocalStorage consent save failed:', e);
    }
    hide();
  };

  document.getElementById('btn-accept-cookies').onclick = () => saveConsent('accepted');
  document.getElementById('btn-decline-cookies').onclick = () => saveConsent('declined');
  document.getElementById('btn-close-x').onclick = () => saveConsent('declined');
})();
