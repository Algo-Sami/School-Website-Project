/**
 * intro.js  —  Scroll-Driven Brand Experience v2
 * Ashraf Islamia Model Public Secondary School
 *
 * Phase A  0 – 80 %   Candle lighting sequence
 * Phase B 80 – 90 %   SVG candles crossfade into school logo (large, centred)
 * Phase C 90 – 100 %  Logo journeys to navbar; homepage dawns behind it
 *
 * Dispatches: 'intro:complete' CustomEvent on document when done.
 */

(function () {
  'use strict';

  const SESSION_KEY     = 'aimps_intro_shown';
  const PARTICLES_COUNT = 8;
  function markShown() { sessionStorage.setItem(SESSION_KEY, '1'); }
  function setPhase(overlay, phase) { overlay.dataset.phase = phase; }
  function dispatch(name) {
    document.dispatchEvent(new CustomEvent(name, { bubbles: true }));
  }

  /* ── Easing helpers ── */
  function clamp01(t) { return Math.max(0, Math.min(1, t)); }
  function smoothstep(t)     { t = clamp01(t); return t * t * (3 - 2 * t); }
  function easeOutCubic(t)   { return 1 - Math.pow(1 - clamp01(t), 3); }
  function easeInOutCubic(t) {
    t = clamp01(t);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Particle System ── */
  function initParticles(canvas, getFlamePos) {
    const ctx = canvas.getContext('2d');
    let rafId, running = true;
    const particles = [];
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    function spawnParticle() {
      const origin = getFlamePos();
      if (!origin) return;
      // slightly wider spread for bloom effect
      const angle = (Math.random() - 0.5) * 0.3;
      const speed = 0.3 + Math.random() * 0.5;
      particles.push({
        x: origin.x + (Math.random() - 0.5) * 4, y: origin.y,
        vx: Math.sin(angle) * speed * 0.25, vy: -(speed + 0.25),
        size: 0.8 + Math.random() * 1.2, life: 0,
        maxLife: 60 + Math.random() * 40,
        hue: 35 + Math.random() * 15, sat: 85 + Math.random() * 15,
      });
    }
    let frameCount = 0;
    function tick() {
      if (!running) return;
      rafId = requestAnimationFrame(tick);
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frameCount % 22 === 0 && particles.length < PARTICLES_COUNT) spawnParticle();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        const prog  = p.life / p.maxLife;
        const alpha = prog < 0.2 ? prog / 0.2 : 1 - ((prog - 0.2) / 0.8);
        if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
        const size = p.size * (1 - prog * 0.25);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5);
        g.addColorStop(0,   'hsla(' + p.hue + ',' + p.sat + '%,94%,' + alpha + ')');
        g.addColorStop(0.5, 'hsla(' + (p.hue-5) + ',' + p.sat + '%,70%,' + (alpha*0.5) + ')');
        g.addColorStop(1,   'hsla(' + (p.hue-12) + ',60%,50%,0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }
    }
    tick();
    return function stop() {
      running = false; cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }

  let resizeHandler = null;
  let keydownHandler = null;
  let cachedNavRect = null;
  let cachedIntroStartRect = null;

  /* ── Scroll Render Engine ── */
  function render(pct, n) {

    // Phase label
    if      (pct < 5)  setPhase(n.overlay, 'silhouettes');
    else if (pct < 80) setPhase(n.overlay, 'lighting');
    else if (pct < 90) setPhase(n.overlay, 'transforming');
    else               setPhase(n.overlay, 'journeying');

    // ═══════════════════════════════════════════════════════
    // PHASE A  —  Candle Lighting  (scroll 0 → 80 %)
    // Remap 0-80% scroll → candlePct 0-100 so original
    // candle thresholds remain unchanged.
    // ═══════════════════════════════════════════════════════
    var candlePct = pct >= 80 ? 100 : (pct / 80) * 100;

    [n.c1, n.c2, n.c3, n.c4].forEach(function(c) { if(c) c.classList.remove('lit'); });
    if (n.c5) n.c5.classList.add('lit');

    // Candle 5 brightens
    var s5 = candlePct <= 15 ? 1.0 + (candlePct / 15) * 0.4 : 1.4;
    if (n.f5) { n.f5.style.transform = 'scale(' + s5 + ')'; n.f5.style.opacity = '1'; }

    // Candle 5 lean
    var rot5 = -32;
    if      (candlePct > 15 && candlePct <= 25) rot5 = -32 - ((candlePct - 15) / 10) * 12;
    else if (candlePct > 25 && candlePct <= 36) rot5 = -44;
    else if (candlePct > 36 && candlePct <= 40) rot5 = -44 + ((candlePct - 36) / 4) * 12;
    if (n.c5) n.c5.style.transform = 'rotate(' + rot5 + 'deg)';

    // Candle 4
    var s4 = 0;
    if      (candlePct > 25 && candlePct <= 36) s4 = (candlePct - 25) / 11;
    else if (candlePct > 36) s4 = 1.0;
    if (n.f4) { n.f4.style.transform = 'scale(' + s4 + ')'; n.f4.style.opacity = s4; }
    if (s4 > 0.1 && n.c4) n.c4.classList.add('lit');

    // Candle 3
    var s3 = 0;
    if      (candlePct > 40 && candlePct <= 52) s3 = (candlePct - 40) / 12;
    else if (candlePct > 52) s3 = 1.0;
    if (n.f3) { n.f3.style.transform = 'scale(' + s3 + ')'; n.f3.style.opacity = s3; }
    if (s3 > 0.1 && n.c3) n.c3.classList.add('lit');

    // Candle 2
    var s2 = 0;
    if      (candlePct > 60 && candlePct <= 72) s2 = (candlePct - 60) / 12;
    else if (candlePct > 72) s2 = 1.0;
    if (n.f2) { n.f2.style.transform = 'scale(' + s2 + ')'; n.f2.style.opacity = s2; }
    if (s2 > 0.1 && n.c2) n.c2.classList.add('lit');

    // Candle 1
    var s1 = 0;
    if      (candlePct > 80 && candlePct <= 92) s1 = (candlePct - 80) / 12;
    else if (candlePct > 92) s1 = 1.0;
    if (n.f1) { n.f1.style.transform = 'scale(' + s1 + ')'; n.f1.style.opacity = s1; }
    if (s1 > 0.1 && n.c1) n.c1.classList.add('lit');

    var litCount = 1 + (s4 > 0.5 ? 1 : 0) + (s3 > 0.5 ? 1 : 0) + (s2 > 0.5 ? 1 : 0) + (s1 > 0.5 ? 1 : 0);

    // Ambient glow maps to candlePct
    var glowProgress = Math.min(100, candlePct) / 100;
    if (pct < 90) {
      if (n.bgAmbient) {
        n.bgAmbient.style.opacity   = glowProgress * 0.85;
        n.bgAmbient.style.transform = 'scale(' + (0.7 + glowProgress * 0.3) + ')';
      }
      if (n.candlesGlow) n.candlesGlow.style.opacity = 0.15 + glowProgress * 0.75;
    }
    if (n.floorScene) {
      n.floorScene.style.opacity = pct < 80
        ? 0.02 + glowProgress * 0.03
        : Math.max(0, (1 - easeInOutCubic((pct - 80) / 10)) * 0.05);
    }

    // ═══════════════════════════════════════════════════════
    // Pre-compute Phase C progress here so it is available
    // throughout Phase B (the introWrap guard below needs it).
    // ═══════════════════════════════════════════════════════
    var jProg  = pct >= 90 ? Math.min(1, (pct - 90) / 10) : 0;
    var jEased = smoothstep(jProg);

    // ═══════════════════════════════════════════════════════
    // PHASE B  —  Transform  (scroll 80 → 90 %)
    // SVG candles dissolve into wooden seal candles seamlessly.
    // ═══════════════════════════════════════════════════════
    var tProg  = pct >= 80 ? Math.min(1, (pct - 80) / 10) : 0;
    var tEased = easeInOutCubic(tProg);

    // Show logo circle background at same time as logo fades in (no black flash)
    if (pct >= 80) n.introWrap.classList.add('show-bg');
    else           n.introWrap.classList.remove('show-bg');

    // SVG candles: fade + settle into logo candles
    if (pct < 80) {
      if (n.wrap) { n.wrap.style.opacity = '1'; n.wrap.style.transform = 'translateY(8%) scale(1.3)'; }
    } else {
      if (n.wrap) {
        n.wrap.style.opacity   = Math.max(0, 1 - tEased * 1.25);
        n.wrap.style.transform = 'translateY(8%) scale(' + (1.3 - tEased * 0.35) + ')';
      }
    }

    // School logo seal: 1:1 scale alignment with SVG candles
    if (pct < 80) {
      if (n.logoBg) { n.logoBg.style.opacity = '0'; n.logoBg.style.transform = 'scale(1)'; }
    } else {
      if (n.logoBg) {
        n.logoBg.style.opacity   = Math.min(1, tEased * 1.25);
        n.logoBg.style.transform = 'scale(1)';
      }
    }

    // Keep introWrap at normal scale during Phase B
    if (jProg === 0) {
      if (pct < 80) {
        if (n.introWrap) n.introWrap.style.transform = 'none';
      } else {
        if (n.introWrap) n.introWrap.style.transform = 'scale(1)';
      }
    }

    // Motto fades up during transform
    if (n.motto) {
      if (pct < 80) {
        n.motto.style.opacity   = Math.min(1.0, 0.2 + (litCount - 1) * 0.2);
        n.motto.style.transform = 'none';
      } else {
        n.motto.style.opacity   = Math.max(0, 1.0 - tEased * 2);
        n.motto.style.transform = 'translateY(' + (-tEased * 14) + 'px)';
      }
    }

    // Text group fades up
    if (pct < 80) {
      if (n.textGroup) { n.textGroup.style.opacity = '1'; n.textGroup.style.transform = 'none'; }
    } else {
      if (n.textGroup) {
        var tf = Math.min(1, tEased * 1.7);
        n.textGroup.style.opacity   = Math.max(0, 1 - tf);
        n.textGroup.style.transform = 'translateY(' + (-tEased * 20) + 'px)';
      }
    }

    // Golden bloom burst when ALL candles are fully lit
    if (candlePct >= 92 && !n.bloomTriggered && n.bloomBurst) {
      n.bloomTriggered = true;
      n.bloomBurst.classList.add('active');
      setTimeout(function () { if (n.bloomBurst) n.bloomBurst.classList.remove('active'); }, 1400);
    }

    // ═══════════════════════════════════════════════════════
    // PHASE C  —  Journey  (scroll 90 → 100 %)
    // School logo seal flies from centre to navbar.
    // Dark background dissolves → homepage dawns behind it.
    // Navbar slides in as the logo settles.
    // ═══════════════════════════════════════════════════════

    var mc = document.getElementById('main-content');
    var nb = document.getElementById('navbar');

    if (jProg > 0) {

      // Dissolve dark background layers → homepage shows through
      var bgFade = easeOutCubic(jProg);
      if (n.layerNavy)   n.layerNavy.style.opacity   = Math.max(0, 1    - bgFade);
      if (n.layerGlow)   n.layerGlow.style.opacity   = Math.max(0, 1    - bgFade);
      if (n.vignette)    n.vignette.style.opacity    = Math.max(0, 1    - bgFade);
      if (n.bgAmbient)   n.bgAmbient.style.opacity   = Math.max(0, 0.85 - bgFade * 0.85);
      if (n.candlesGlow) n.candlesGlow.style.opacity = Math.max(0, 0.9  - bgFade * 0.9);

      // Logo journeys with pixel-perfect accuracy to navbar position
      if (n.navLogo && n.introWrap) {
        if (!cachedNavRect) {
          var oldNbTransform = nb ? nb.style.transform : '';
          if (nb) nb.style.transform = 'translateY(0)';
          cachedNavRect = n.navLogo.getBoundingClientRect();
          if (nb) nb.style.transform = oldNbTransform;
        }

        if (!cachedIntroStartRect) {
          var oldIntroTransform = n.introWrap.style.transform;
          n.introWrap.style.transform = 'none';
          cachedIntroStartRect = n.introWrap.getBoundingClientRect();
          n.introWrap.style.transform = oldIntroTransform;
        }

        var r = cachedNavRect;
        var s = cachedIntroStartRect;

        var startCX = s.left + s.width / 2;
        var startCY = s.top + s.height / 2;
        var targetCX = r.left + r.width / 2;
        var targetCY = r.top + r.height / 2;

        var dx = (targetCX - startCX) * jEased;
        var dy = (targetCY - startCY) * jEased;

        // Scale from grand seal size down to navbar logo icon size
        var navScale = (r.width || 46) / (s.width || 380);
        var sc = 1 - jEased * (1 - navScale);

        n.introWrap.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + sc + ')';
        n.introWrap.style.boxShadow = 'none';

        if (n.logoBg) {
          n.logoBg.style.transform = 'scale(1)';
        }
      }

      // Homepage dawns up from slightly below
      if (mc) {
        mc.style.opacity    = String(jEased);
        mc.style.visibility = 'visible';
        mc.style.transform  = 'translateY(' + ((1 - jEased) * 28) + 'px)';
      }

      // Navbar slides in once logo is ~40% along its journey
      var nbProg  = Math.max(0, (jProg - 0.4) / 0.6);
      var nbEased = easeOutCubic(nbProg);
      if (nb) {
        nb.style.opacity   = String(nbEased);
        nb.style.transform = 'translateY(' + (-100 + nbEased * 100) + '%)';
      }

    } else {
      // Before journey — introWrap handled by Phase B block above
      if (n.layerNavy) n.layerNavy.style.opacity   = '';
      if (n.layerGlow) n.layerGlow.style.opacity   = '';
      if (n.vignette)  n.vignette.style.opacity    = '';
      if (mc) { mc.style.opacity = '0'; mc.style.visibility = 'hidden'; mc.style.transform = 'translateY(28px)'; }
      if (nb) { nb.style.opacity = '0'; nb.style.transform = 'translateY(-100%)'; }
    }
  }

  /* ── Complete / Skip ── */
  function finish(overlay, stopParticles, isSkip) {
    overlay.style.display='none'; overlay.setAttribute('aria-hidden','true');
    var sp=document.getElementById('prologue-spacer'); if(sp) sp.remove();
    document.body.classList.remove('prologue-active');
    // Temporarily disable smooth-scroll so scrollTo(0,0) is instant (not animated).
    // html { scroll-behavior: smooth } in style.css would cause a visible scroll-back glitch.
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    setTimeout(function () { document.documentElement.style.scrollBehavior = ''; }, 100);
    document.body.classList.add(isSkip?'intro-skip':'intro-complete');
    if(stopParticles) stopParticles();
    if(resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    if(keydownHandler) {
      window.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    cachedNavRect = null;
    cachedIntroStartRect = null;
    markShown();
    // Clear any inline styles set by render() so CSS class-based rules can take effect
    var mc=document.getElementById('main-content');
    var nb=document.getElementById('navbar');
    if(mc){ mc.style.opacity=''; mc.style.visibility=''; mc.style.transform=''; }
    if(nb){ nb.style.opacity=''; nb.style.transform=''; }
    setTimeout(function(){ dispatch('intro:complete'); }, 0);
  }

  /* ── Init ── */
  function initIntro() {
    var overlay=document.getElementById('intro-overlay');
    if(!overlay) return;

    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isAlreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';

    if(isAlreadyShown){
      var sp=document.getElementById('prologue-spacer'); if(sp) sp.remove();
      document.body.classList.remove('prologue-active');
      overlay.style.display='none'; overlay.setAttribute('aria-hidden','true');
      document.body.classList.add('intro-skip');
      markShown(); setTimeout(function(){ dispatch('intro:complete'); },0);
      return;
    }

    document.body.classList.add('prologue-active');

    var n={
      overlay:overlay,
      introWrap:overlay.querySelector('.intro-logo-wrap'),
      logoBg:overlay.querySelector('.intro-logo-bg-image'),
      textGroup:overlay.querySelector('.intro-text-group'),
      wrap:overlay.querySelector('.intro-candles-wrap'),
      c1:overlay.querySelector('.candle-1'),
      c2:overlay.querySelector('.candle-2'),
      c3:overlay.querySelector('.candle-3'),
      c4:overlay.querySelector('.candle-4'),
      c5:overlay.querySelector('.candle-5'),
      bgAmbient:overlay.querySelector('.intro-bg-ambient'),
      candlesGlow:overlay.querySelector('.intro-candles-glow'),
      navLogo:document.querySelector('.nav-logo-icon'),
      motto:overlay.querySelector('.intro-motto'),
      floorScene:overlay.querySelector('.floor-scene'),
      // Background layers dissolved in Phase C to reveal homepage
      layerNavy:overlay.querySelector('.intro-layer-navy'),
      layerGlow:overlay.querySelector('.intro-layer-glow'),
      vignette:overlay.querySelector('.intro-vignette'),
      // Golden bloom burst
      bloomBurst:overlay.querySelector('.intro-bloom-burst'),
      bloomTriggered:false
    };
    n.f1=n.c1?n.c1.querySelector('.flame-g'):null;
    n.f2=n.c2?n.c2.querySelector('.flame-g'):null;
    n.f3=n.c3?n.c3.querySelector('.flame-g'):null;
    n.f4=n.c4?n.c4.querySelector('.flame-g'):null;
    n.f5=n.c5?n.c5.querySelector('.flame-g'):null;

    var canvas=document.getElementById('intro-particles'), stopParticles=null;
    if(canvas && !hasReducedMotion){
      stopParticles=initParticles(canvas,function(){
        var lit=Array.from(overlay.querySelectorAll('.candle-g.lit'));
        if(!lit.length) return null;
        var wick=lit[Math.floor(Math.random()*lit.length)].querySelector('.candle-wick');
        if(!wick) return null;
        var r=wick.getBoundingClientRect(); return{x:r.left+r.width/2,y:r.top-2};
      });
    }

    if (hasReducedMotion) {
      // Reduced motion logic: display completed static scene briefly, then fade out
      [n.c1, n.c2, n.c3, n.c4, n.c5].forEach(function(c) {
        if(c) c.classList.add('lit');
      });
      [n.f1, n.f2, n.f3, n.f4, n.f5].forEach(function(f) {
        if(f) { f.style.transform = 'scale(1)'; f.style.opacity = '1'; }
      });
      if(n.candlesGlow) n.candlesGlow.style.opacity = 0.8;
      if(n.bgAmbient) { n.bgAmbient.style.opacity = 1; n.bgAmbient.style.transform = 'scale(1)'; }
      if(n.motto) n.motto.style.opacity = '1';
      if(n.floorScene) n.floorScene.style.opacity = '0.05';
      
      var scrollBlock = overlay.querySelector('.intro-scroll-block');
      if(scrollBlock) scrollBlock.style.display = 'none';

      setTimeout(function() {
        overlay.classList.add('fade-out');
        setTimeout(function() {
          finish(overlay, stopParticles, true);
        }, 800);
      }, 1500);
      return;
    }

    if(n.c5) n.c5.classList.add('lit');
    if(n.f5){n.f5.style.transform='scale(1)';n.f5.style.opacity='1';}
    render(0,n);

    var isFinished = false;
    var currentPct = 0;
    var targetPct = 0;
    var animFrameId = null;

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function updateLoop() {
      // Smoothly interpolate current percentage towards target percentage
      currentPct = lerp(currentPct, targetPct, 0.16);
      if (Math.abs(targetPct - currentPct) < 0.04) {
        currentPct = targetPct;
      }

      render(currentPct, n);

      if (targetPct >= 99.2 && currentPct >= 98.8) {
        if (!isFinished) {
          isFinished = true;
          window.removeEventListener('scroll', onScroll);
          if (animFrameId) cancelAnimationFrame(animFrameId);
          // Snap logo to exact navbar position before hiding overlay
          if (n.navLogo && n.introWrap && cachedNavRect && cachedIntroStartRect) {
            var r = cachedNavRect;
            var s = cachedIntroStartRect;
            var finalDx = (r.left + r.width / 2) - (s.left + s.width / 2);
            var finalDy = (r.top  + r.height / 2) - (s.top  + s.height / 2);
            var finalSc = (r.width || 46) / (s.width || 380);
            n.introWrap.style.transition = 'transform 150ms ease-out';
            n.introWrap.style.transform  = 'translate(' + finalDx + 'px, ' + finalDy + 'px) scale(' + finalSc + ')';
          }
          setTimeout(function () { finish(overlay, stopParticles, false); }, 200);
        }
        return;
      }

      if (Math.abs(targetPct - currentPct) >= 0.04) {
        animFrameId = requestAnimationFrame(updateLoop);
      } else {
        animFrameId = null;
      }
    }

    function onScroll() {
      if (isFinished) return;
      var maxScroll = window.innerHeight * 1.5;
      var sv = Math.min(window.scrollY, maxScroll);
      targetPct = (sv / maxScroll) * 100;

      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updateLoop);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    resizeHandler = function onResize() {
      cachedNavRect = null;
      cachedIntroStartRect = null;
      var sp = document.getElementById('prologue-spacer');
      if (sp) {
        sp.style.height = (window.innerHeight * 1.5) + 'px';
      }
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
    resizeHandler(); // initial call

    function doSkip() {
      if (isFinished) return;
      isFinished = true;
      window.removeEventListener('scroll', onScroll);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      finish(overlay, stopParticles, true);
    }
    overlay.addEventListener('click', doSkip, { once: true });

    keydownHandler = function onKeyDown(e) {
      if (isFinished) return;
      if (['ArrowDown', ' ', 'PageDown'].indexOf(e.key) > -1) {
        e.preventDefault();
        window.scrollBy({ top: 160, behavior: 'smooth' });
      } else if (['ArrowUp', 'PageUp'].indexOf(e.key) > -1) {
        e.preventDefault();
        window.scrollBy({ top: -160, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', keydownHandler);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initIntro);
  } else {
    initIntro();
  }

})();
