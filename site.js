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

  // ─── SMOOTH SCROLL & CLEAN URL (NO INDEX.HTML OR UGLY # HASHES) ───
  function getCleanPath() {
    let path = window.location.pathname.replace(/\/index\.html$/, '');
    return path === '' ? '/' : path;
  }

  function cleanBrowserUrl() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, getCleanPath());
    }
  }

  // Immediately strip /index.html from URL bar on load if present
  if (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/index.html') {
    cleanBrowserUrl();
  }

  function cleanScrollTo(targetId) {
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const headerOffset = 85;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      cleanBrowserUrl();
    }
  }

  // Intercept anchor clicks on the page for smooth scroll & clean URL
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        const targetId = href.substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          cleanScrollTo(targetId);
          if (nav && nav.classList.contains('menu-open')) {
            nav.classList.remove('menu-open');
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
          }
        }
      }
    }
  });

  // If page loads with a hash (e.g. #services), smooth scroll and clean URL
  if (window.location.hash) {
    const initialHash = window.location.hash.substring(1);
    setTimeout(() => {
      cleanScrollTo(initialHash);
    }, 100);
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

  // ─── $100M AGENCY PORTFOLIO & WORK LIGHTBOX MODAL ───
  const workProjects = {
    chapitre1: {
      title: "Chapitre 1 — Contemporary Editorial Art Direction",
      subtitle: "Editorial Design • Publication Grid • Print Direction",
      client: "Chapitre 1 Magazine",
      year: "2026",
      deliverables: "Editorial Layout Architecture, Typographic Hierarchy, Cover Conception, Print Specifications",
      desc: "Chapitre 1 is an independent print publication exploring contemporary culture, architecture, and visual aesthetics. Toolbox Studio created a disciplined yet dynamic editorial grid system, balancing brutalist display serif typography with expansive negative space, high-contrast imagery pacing, and print-ready production specifications.",
      images: [
        "images/work/chapitre1_mockup.jpg",
        "images/work/chapitre1_pages_p1.jpg",
        "images/work/chapitre1_pages_p2.jpg",
        "images/work/chapitre1_pages_p3.jpg"
      ]
    },
    mk: {
      title: "MK Studio — Visual Identity & Merchandise Architecture",
      subtitle: "Brand Identity • Stationery • Packaging Collateral",
      client: "MK Studio",
      year: "2026",
      deliverables: "Geometric Monogram Mark, Brand Color Architecture, Vinyl Stickers, Letterheads, Packaging",
      desc: "A bold, minimalist visual identity system developed for MK Studio. Designed around an architectural monogram mark with pure geometry, the identity expands seamlessly across tactile merchandise, holographic and die-cut vinyl stickers, executive stationery, and digital presence.",
      images: [
        "images/work/mk_branding.jpg",
        "images/work/mk_stickers.jpg",
        "images/work/mh_charte_p1.jpg"
      ]
    },
    magictouch: {
      title: "Magic Touch — Automotive Luxury & Corporate Identity",
      subtitle: "Brand Guidelines • Luxury Detailing • Vehicle Livery",
      client: "Magic Touch Studio",
      year: "2025",
      deliverables: "Complete Brand Standards Manual, Color Architecture, Vehicle Livery Guidelines, Signage",
      desc: "Magic Touch delivers ultra-premium ceramic coating and automotive preservation for luxury sports cars. We established an authoritative, high-prestige brand identity manual featuring dark-mode color hierarchies, vehicle wrap/livery standards, luminous signage blueprints, and client warranty certification kits.",
      images: [
        "images/work/magictouch_p1.jpg",
        "images/work/magictouch_p2.jpg",
        "images/work/magictouch_p3.jpg",
        "images/work/magictouch_p4.jpg"
      ]
    },
    purrfect: {
      title: "Purrfect — Modern Pet Lifestyle Brand Guidelines",
      subtitle: "Brand Manual • Design Tokens • Packaging Architecture",
      client: "Purrfect Lifestyle",
      year: "2025",
      deliverables: "Brand Identity Manual, Packaging Scales, Typography Tokens, Digital Standards",
      desc: "Purrfect is a design-forward pet lifestyle brand combining playful warmth with clean modernism. The comprehensive brand guidelines define dual-tone color hierarchies, responsive typographic scales, packaging box structures, and digital design tokens engineered for swift international retail expansion.",
      images: [
        "images/work/purrfect_p1.jpg",
        "images/work/purrfect_p2.jpg",
        "images/work/purrfect_p3.jpg",
        "images/work/purrfect_p4.jpg"
      ]
    },
    idokanino: {
      title: "Idokanino — Organic Heritage Visual Identity",
      subtitle: "Brand Identity • Heritage Branding • Artisanal Packaging",
      client: "Idokanino",
      year: "2025",
      deliverables: "Visual Identity Manual, Earthy Palette Formulation, Organic Packaging Guidelines",
      desc: "An earthy, artisanal brand identity rooted in rich cultural heritage. The identity pairs organic, warm earth tones with refined minimalist typography, sustainable packaging concepts, and authentic brand storytelling guidelines tailored for premium conscious consumers.",
      images: [
        "images/work/idokanino_p1.jpg"
      ]
    },
    googlefocus: {
      title: "Google Focus Series — Exhibition Print & Campaign Design",
      subtitle: "Print Direction • Poster Series • Visual Campaign",
      client: "Focus Series Exhibition",
      year: "2025",
      deliverables: "Exhibition Poster Series, Print Direction, High-Contrast Typographic Art Direction",
      desc: "A bold conceptual print campaign exploring spatial tension, extreme scale shifts, and high-contrast typography. Created for exhibition collateral and poster display, the series illustrates clarity and focus in an era of information overload.",
      images: [
        "images/work/googlefocus_mockup.jpg"
      ]
    },
    softtouch: {
      title: "Soft Touch Skincare — Luxury Cosmetic Identity & Packaging",
      subtitle: "Brand Identity • Packaging Architecture • Art Direction",
      client: "Soft Touch Paris",
      year: "2025",
      deliverables: "Bespoke Logomark, Luxury Packaging System, Minimalist Brand Standards, Social Art Direction",
      desc: "An ultra-refined visual identity designed for Soft Touch Skincare. Built with gentle, organic visual tones, modern typography, tactile packaging mockups, and calm luxury art direction.",
      images: [
        "images/work/pic2_visual.jpg",
        "images/work/googlefocus_mockup.jpg",
        "images/work/logo_softtouch.png"
      ]
    },
    deutsch: {
      title: "Deutsch Brandmark — Modern Wordmark & Visual System",
      subtitle: "Logomark System • Typography Architecture • Brand Guidelines",
      client: "Deutsch Corp",
      year: "2025",
      deliverables: "Geometric Wordmark, Typography Hierarchy, Corporate Color Palettes, Brand Collateral",
      desc: "A precision-engineered wordmark crafted with architectural geometry, heavy horizontal emphasis, and balanced kerning. Built to project authoritative confidence across corporate environments and digital touchpoints.",
      images: [
        "images/work/logo_deutsch.png",
        "images/work/logo_showcase_main.jpg"
      ]
    },
    signature: {
      title: "Signature Logomarks & Identity Archive",
      subtitle: "Identity Archive • Monogram Systems • Brandmarks",
      client: "Toolbox Studio Archive",
      year: "2025–2026",
      deliverables: "Custom Logomarks, Monograms, Camera Mark Identity, Geometric Crests",
      desc: "A curated collection of bespoke logomarks, vector emblems, and monogram marks designed for various private clients across fashion, photography, technology, and luxury services.",
      images: [
        "images/work/logo_showcase_2.png",
        "images/work/logo_showcase_main.jpg",
        "images/work/logo_showcase_3.png"
      ]
    }
  };

  // Filter Buttons Handler
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  if (filterBtns.length > 0 && workCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.getAttribute('data-filter');

        workCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Project Modal Dialog
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-project-title');
  const modalSubtitle = document.getElementById('modal-project-subtitle');
  const modalGallery = document.getElementById('modal-project-gallery');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalClient = document.getElementById('modal-project-client');
  const modalYear = document.getElementById('modal-project-year');
  const modalDeliverables = document.getElementById('modal-project-deliverables');
  const modalWA = document.getElementById('modal-project-wa');
  const modalLive = document.getElementById('modal-project-live');

  function openProjectModal(projectId) {
    const data = workProjects[projectId];
    if (!data || !projectModal) return;

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalClient.textContent = data.client;
    modalYear.textContent = data.year;
    modalDeliverables.textContent = data.deliverables;
    modalDesc.textContent = data.desc;

    // Handle Live URL button
    if (modalLive) {
      if (data.liveUrl) {
        modalLive.href = data.liveUrl;
        modalLive.style.display = 'inline-flex';
      } else {
        modalLive.style.display = 'none';
      }
    }

    // Set prefilled WhatsApp inquiry
    const waText = encodeURIComponent(`Hello Mohammed, I explored your ${data.title} project on Toolbox Studio and would like to discuss a similar project.`);
    modalWA.href = `https://wa.me/212776332317?text=${waText}`;

    // Populate images
    modalGallery.innerHTML = '';
    data.images.forEach((imgSrc, idx) => {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'modal-gallery-img';
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `${data.title} - Visual ${idx + 1}`;
      img.loading = idx === 0 ? 'eager' : 'lazy';
      imgWrap.appendChild(img);
      modalGallery.appendChild(imgWrap);
    });

    try {
      if (typeof projectModal.showModal === 'function') {
        if (!projectModal.open) projectModal.showModal();
      } else {
        projectModal.setAttribute('open', '');
      }
    } catch (err) {
      projectModal.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (projectModal) {
      try {
        if (typeof projectModal.close === 'function') {
          projectModal.close();
        } else {
          projectModal.removeAttribute('open');
        }
      } catch (err) {
        projectModal.removeAttribute('open');
      }
      document.body.style.overflow = '';
    }
  }

  // Global delegation for all project modal triggers (work cards and logomarks)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-project]');
    if (trigger) {
      if (trigger.tagName === 'A' && trigger.getAttribute('href') && trigger.getAttribute('href').startsWith('http')) {
        return;
      }
      e.preventDefault();
      const projectId = trigger.getAttribute('data-project');
      if (projectId) {
        openProjectModal(projectId);
      }
    }
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    // Light dismiss: click outside the modal-inner closes it
    projectModal.addEventListener('click', (e) => {
      const rect = projectModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog || e.target === projectModal) {
        closeProjectModal();
      }
    });

    projectModal.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }
})();

