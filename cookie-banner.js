(function() {
  // Check if user already accepted cookies
  if (localStorage.getItem('cookieConsent') === 'accepted') {
    return; // Do nothing
  }

  // Create CSS for the cookie banner
  const style = document.createElement('style');
  style.textContent = `
    .cookie-banner {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      width: calc(100% - 48px);
      max-width: 460px;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 100000;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cookie-banner.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .cookie-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cookie-icon {
      color: #b8d9f0;
    }
    .cookie-title {
      font-family: 'Playfair Display', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: #f5f4f0;
      letter-spacing: 0.02em;
      margin: 0;
    }
    .cookie-text {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #888;
      margin: 0;
    }
    .cookie-text a {
      color: #b8d9f0;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .cookie-text a:hover {
      opacity: 0.8;
    }
    .cookie-actions {
      display: flex;
      gap: 12px;
    }
    .cookie-btn-accept {
      background: #b8d9f0;
      color: #080808;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      flex: 1;
      transition: background 0.2s, transform 0.2s;
    }
    .cookie-btn-accept:hover {
      background: #f5f4f0;
      transform: translateY(-2px);
    }
    .cookie-btn-close {
      background: transparent;
      color: #888;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 20px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      flex: 1;
      transition: all 0.2s;
    }
    .cookie-btn-close:hover {
      color: #f5f4f0;
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    @media (max-width: 480px) {
      .cookie-banner {
        bottom: 16px;
        width: calc(100% - 32px);
        padding: 16px;
      }
      .cookie-actions {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(style);

  // Create HTML for the cookie banner
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-header">
      <svg class="cookie-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="12.5" r="1.5" fill="currentColor"/>
        <circle cx="12" cy="17" r="2" fill="currentColor"/>
      </svg>
      <p class="cookie-title">We use cookies</p>
    </div>
    <p class="cookie-text">
      We use cookies to improve your experience and track website performance. 
      By continuing to use this site, you agree to our use of cookies.
    </p>
    <div class="cookie-actions">
      <button class="cookie-btn-accept" id="btn-accept-cookies">Accept All</button>
      <button class="cookie-btn-close" id="btn-decline-cookies">Decline</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Animate in after a small delay
  setTimeout(() => {
    banner.classList.add('show');
  }, 2000);

  // Handle Accept
  document.getElementById('btn-accept-cookies').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 600);
  });

  // Handle Decline (Just hide for this session or remember decline)
  document.getElementById('btn-decline-cookies').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'declined');
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 600);
  });
})();

// Mobile Menu Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const hamburger = document.querySelector('.hamburger-btn');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('menu-open');
    });

    // Close menu when clicking a link
    if (navLinks) {
      const links = navLinks.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('menu-open');
        });
      });
    }
  }
});
