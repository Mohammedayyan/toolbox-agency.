(function () {
  const nav = document.getElementById('nav');
  const menuBtn = document.querySelector('.menu-btn');
  const navList = document.getElementById('nav-list');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ─── 3D LOGO ROBOT INTERACTION ───
  const robotCard = document.getElementById('robot-card');
  const robotWrapper = document.querySelector('.hero-robot-wrapper');

  if (robotCard && robotWrapper) {
    // Add default floating class
    robotCard.classList.add('is-floating');

    let targetRX = 0;
    let targetRY = 0;
    let targetMX = 0;
    let targetMY = 0;

    let currentRX = 0;
    let currentRY = 0;
    let currentMX = 0;
    let currentMY = 0;

    let lastMouseMoveTime = Date.now();
    let isMouseOver = false;

    let lastMouseX = 0;
    let lastMouseY = 0;
    let rageLevel = 0;

    // Listen to mousemove on the document to track cursor
    window.addEventListener('mousemove', (e) => {
      lastMouseMoveTime = Date.now();
      
      const rect = robotWrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Limit interaction range to 800px around the card
      const maxDistance = 800;

      // Rage calculations on rapid cursor shaking (pure distance base)
      if (isMouseOver) {
        const dist = Math.sqrt((e.clientX - lastMouseX) ** 2 + (e.clientY - lastMouseY) ** 2);
        if (dist > 30) {
          rageLevel = Math.min(150, rageLevel + 12);
        }
      }
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      
      if (distance < maxDistance) {
        if (!isMouseOver) {
          isMouseOver = true;
          robotCard.classList.remove('is-floating');
        }
        
        // Tilt calculations (max 15 degrees)
        const factor = (maxDistance - distance) / maxDistance; // stronger closer to center
        const maxTilt = 15;
        targetRX = -((dy / (window.innerHeight / 2)) * maxTilt) * factor;
        targetRY = ((dx / (window.innerWidth / 2)) * maxTilt) * factor;
        
        // Eye offset tracking cursor (max 16px translation in SVG viewport coords)
        const maxEyeMove = 16;
        targetMX = (dx / (rect.width / 2)) * maxEyeMove;
        targetMY = (dy / (rect.height / 2)) * maxEyeMove;
        
        // Clamp eye offsets to safe bounds
        targetMX = Math.max(-maxEyeMove, Math.min(maxEyeMove, targetMX));
        targetMY = Math.max(-maxEyeMove, Math.min(maxEyeMove, targetMY));
      } else {
        resetRobotState();
      }
    });

    // Reset rotation and eye offsets when cursor leaves viewport or window
    document.addEventListener('mouseleave', () => {
      resetRobotState();
    });

    function resetRobotState() {
      if (isMouseOver) {
        isMouseOver = false;
        // Wait for lerp to return close to center before adding float animation back
        setTimeout(() => {
          if (!isMouseOver) {
            robotCard.classList.add('is-floating');
          }
        }, 300);
      }
      targetRX = 0;
      targetRY = 0;
      targetMX = 0;
      targetMY = 0;
    }

    // Organic random eye movement when mouse is idle
    setInterval(() => {
      const idleTime = Date.now() - lastMouseMoveTime;
      // Only trigger random movements if the cursor has been idle for more than 4 seconds
      if (idleTime > 4000 && !isMouseOver) {
        // 60% chance to look in a random direction
        if (Math.random() < 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const range = 6 + Math.random() * 8; // move between 6px and 14px
          targetMX = Math.cos(angle) * range;
          targetMY = Math.sin(angle) * range;
          
          // Return to center after 1-2 seconds
          setTimeout(() => {
            if (Date.now() - lastMouseMoveTime > 5500 && !isMouseOver) {
              targetMX = 0;
              targetMY = 0;
            }
          }, 1000 + Math.random() * 1000);
        }
      }
    }, 3500);

    // Smooth animation loop using LERP
    function animate() {
      // 0.1 interpolator gives a smooth organic damping effect
      currentRX += (targetRX - currentRX) * 0.1;
      currentRY += (targetRY - currentRY) * 0.1;
      currentMX += (targetMX - currentMX) * 0.1;
      currentMY += (targetMY - currentMY) * 0.1;

      // Decay rage level when not frantic
      if (rageLevel > 0) {
        rageLevel -= 1.0;
      } else {
        rageLevel = 0;
      }

      // Toggle angry mouth state when rage threshold is reached
      if (rageLevel >= 100) {
        robotCard.classList.add('is-angry-mouth');
      } else if (rageLevel <= 0) {
        robotCard.classList.remove('is-angry-mouth');
      }

      // Apply rotation on card
      robotCard.style.transform = `rotateX(${currentRX.toFixed(2)}deg) rotateY(${currentRY.toFixed(2)}deg)`;

      // Set eye translation offsets
      robotCard.style.setProperty('--mx', `${currentMX.toFixed(2)}px`);
      robotCard.style.setProperty('--my', `${currentMY.toFixed(2)}px`);

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // ─── DYNAMIC STATS COUNTER ───
  const counters = document.querySelectorAll('.counter-num');
  
  if (counters.length > 0) {
    const runCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1500; // 1.5 seconds count-up duration
      const startTime = performance.now();
      
      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const easedProgress = progress * (2 - progress);
        const currentVal = Math.floor(easedProgress * target);
        
        el.textContent = currentVal + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target + suffix;
          
          // Once target is reached, if it is the Google reviews counter, start periodic live incrementing!
          if (el.id === 'google-reviews-counter') {
            startLiveIncrement(el, target, suffix);
          }
        }
      };
      
      requestAnimationFrame(updateCount);
    };
    
    // Live ticking simulation to show growing stats
    const startLiveIncrement = (el, startVal, suffix) => {
      let currentVal = startVal;
      
      setInterval(() => {
        // Organic simulated increase (reviews count grows randomly)
        // 40% chance to increment every 12 seconds
        if (Math.random() < 0.4) {
          currentVal += 1;
          
          // Trigger smooth scale pop animation
          el.classList.add('counter-pulse');
          el.textContent = currentVal + suffix;
          
          setTimeout(() => {
            el.classList.remove('counter-pulse');
          }, 350);
        }
      }, 12000); // Check for increment every 12 seconds
    };
    
    // Set up scroll-triggered observer
    const observerOptions = {
      root: null,
      threshold: 0.1, // Trigger when 10% of element is in viewport
      once: true
    };
    
    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          self.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  // ─── DYNAMIC THEME TOGGLE ───
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.warn('LocalStorage is blocked:', e);
      }
    });
  }
})();
