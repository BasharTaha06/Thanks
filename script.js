document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     0. HIEROGLYPH FRIEZE — populate seams
     ========================================================= */
  const friezeTpl = document.getElementById('frieze-template');
  document.querySelectorAll('[data-frieze]').forEach((seam, i) => {
    const row1 = friezeTpl.content.cloneNode(true).firstElementChild;
    const row2 = friezeTpl.content.cloneNode(true).firstElementChild;
    row2.style.left = '50%';
    seam.appendChild(row1);
    seam.appendChild(row2);
    if (i % 2 === 1) {
      row1.style.animationDirection = 'reverse';
      row2.style.animationDirection = 'reverse';
    }
  });

  /* =========================================================
     1. CINEMATIC ENTRANCE
     ========================================================= */
  const overlay = document.getElementById('entrance-overlay');
  const heroTitleEl = document.getElementById('hero-title');

  function buildLetterTitle(el, text){
    el.innerHTML = '';
    let delay = 0;
    const words = text.split(' ');
    words.forEach((word, wi) => {
      // Wrap each word in a no-break container so the browser never splits mid-word
      const wordWrap = document.createElement('span');
      wordWrap.style.display = 'inline-block';
      wordWrap.style.whiteSpace = 'nowrap';
      [...word].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.style.animationDelay = `${delay}s`;
        delay += 0.045;
        wordWrap.appendChild(span);
      });
      el.appendChild(wordWrap);
      // Add space between words (not after last word)
      if (wi < words.length - 1) {
        const space = document.createElement('span');
        space.className = 'char';
        space.textContent = '\u00A0';
        space.style.animationDelay = `${delay}s`;
        delay += 0.02;
        el.appendChild(space);
      }
    });
  }
  buildLetterTitle(heroTitleEl, 'A Special Thank You');

  setTimeout(() => {
    overlay.classList.add('hide');
    document.body.style.overflow = 'auto';
  }, 2600);

  document.body.style.overflow = 'hidden';

  /* =========================================================
     2. SCROLL-TRIGGERED REVEALS
     ========================================================= */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-section');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  // Hero elements should reveal shortly after entrance overlay clears,
  // regardless of scroll position (since hero is visible on load).
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach(el => el.classList.add('in-view'));
  }, 2700);

  /* =========================================================
     3. STELA TYPING ANIMATION (triggers when section enters view)
     ========================================================= */
  const stelaText = document.getElementById('stela-text');
  const caret = document.getElementById('typing-caret');
  const stelaSection = document.getElementById('stela');

  const message = [
    { text: 'Dear Doctor,\n\n', cls: 'salutation' },
    { text: 'Thank you for your dedication, guidance, and unwavering support throughout our academic journey. Your knowledge, patience, and encouragement have inspired us to grow, learn, and strive for excellence.\n\n', cls: '' },
    { text: 'Your impact extends far beyond the classroom, and we are deeply grateful for everything you have done for us.\n\n', cls: '' },
    { text: 'With sincere appreciation and respect,', cls: '' },
    { text: '\nYour Students', cls: 'signoff' }
  ];

  let typingStarted = false;

  function typeMessage(){
    if (typingStarted) return;
    typingStarted = true;

    let segIndex = 0;
    let charIndex = 0;
    let currentSpan = null;

    function step(){
      if (segIndex >= message.length){
        caret.classList.add('done');
        return;
      }
      const seg = message[segIndex];

      if (charIndex === 0){
        currentSpan = document.createElement('span');
        if (seg.cls) currentSpan.className = seg.cls;
        stelaText.appendChild(currentSpan);
      }

      if (charIndex < seg.text.length){
        currentSpan.textContent += seg.text[charIndex];
        charIndex++;
        const c = seg.text[charIndex - 1];
        const delay = (c === '.' || c === ',') ? 70 : (c === '\n' ? 40 : 16 + Math.random() * 22);
        setTimeout(step, delay);
      } else {
        segIndex++;
        charIndex = 0;
        setTimeout(step, 120);
      }
    }
    step();
  }

  const stelaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        typeMessage();
      }
    });
  }, { threshold: 0.35 });
  stelaObserver.observe(stelaSection);

  /* =========================================================
     4. SCARAB CROSSING — triggers once per visit to pillars section
     ========================================================= */
  const scarab = document.getElementById('scarab');
  const pillarsSection = document.getElementById('pillars');
  let scarabFired = false;

  const scarabObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !scarabFired){
        scarabFired = true;
        scarab.style.top = (32 + Math.random() * 14) + '%';
        scarab.classList.add('crossing');
        scarabObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  scarabObserver.observe(pillarsSection);

  /* =========================================================
     5. MUSIC TOGGLE
     ========================================================= */
  const musicControl = document.getElementById('music-control');
  const audio = document.getElementById('bg-audio');
  const iconPlay = musicControl.querySelector('.icon-play');
  const iconPause = musicControl.querySelector('.icon-pause');
  let isPlaying = false;

  function toggleMusic(){
    if (!audio.querySelector('source') && !audio.src){
      musicControl.querySelector('.music-label').textContent = 'Add a track in index.html';
      return;
    }
    if (!isPlaying){
      audio.play().catch(() => {
        musicControl.querySelector('.music-label').textContent = 'Audio unavailable';
      });
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      isPlaying = true;
    } else {
      audio.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      isPlaying = false;
    }
  }
  musicControl.addEventListener('click', toggleMusic);
  musicControl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleMusic();
    }
  });

  /* =========================================================
     6. GOLDEN SAND PARTICLES (canvas)
     ========================================================= */
  const canvas = document.getElementById('sand-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas(){
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();

  function spawnParticle(){
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 60,
      r: 0.6 + Math.random() * 1.8,
      speed: 0.25 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.4,
      alpha: 0.15 + Math.random() * 0.45,
      twinkle: Math.random() * Math.PI * 2
    };
  }

  const particleCount = window.innerWidth < 700 ? 35 : 70;
  for (let i = 0; i < particleCount; i++){
    const p = spawnParticle();
    p.y = Math.random() * window.innerHeight;
    particles.push(p);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateParticles(){
    if (prefersReducedMotion) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      p.twinkle += 0.03;
      const flicker = (Math.sin(p.twinkle) + 1) / 2;

      if (p.y < -10){
        Object.assign(p, spawnParticle());
        p.y = window.innerHeight + 10;
      }
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 214, 128, ${p.alpha * (0.5 + flicker * 0.5)})`;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }

  if (!prefersReducedMotion){
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  /* =========================================================
     7. SCROLL CUE — fade out once user starts scrolling
     ========================================================= */
  const scrollCue = document.getElementById('scroll-cue');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80){
      scrollCue.style.opacity = '0';
    } else {
      scrollCue.style.opacity = '';
    }
  }, { passive: true });

  scrollCue.addEventListener('click', () => {
    document.getElementById('stela').scrollIntoView({ behavior: 'smooth' });
  });
});