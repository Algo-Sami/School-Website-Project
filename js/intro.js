/**
 * intro.js - Scroll-Driven Brand Experience (Prologue)
 * Ashraf Islamia Model Public Secondary School
 *
 * Uses native browser scrolling (window.scrollY) so the animation works
 * on all devices, trackpads, touch screens, and automated test runners.
 *
 * Dispatches: 'intro:complete' CustomEvent on document when done.
 */

(function () {
  'use strict';

  const SESSION_KEY     = 'aimps_intro_shown';
  const PARTICLES_COUNT = 5;
  function markShown() { sessionStorage.setItem(SESSION_KEY, '1'); }
  function setPhase(overlay, phase) { overlay.dataset.phase = phase; }
  function dispatch(name) {
    document.dispatchEvent(new CustomEvent(name, { bubbles: true }));
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
  let cachedNavRect = null;
  let cachedIntroWrapWidth = null;

  /* ── Scroll Render Engine ── */
  function render(pct, n) {
    // Phase adjustment
    if      (pct < 5)   setPhase(n.overlay, 'silhouettes');
    else if (pct < 94)  setPhase(n.overlay, 'lighting');
    else if (pct < 100) setPhase(n.overlay, 'stable');
    else                setPhase(n.overlay, 'exiting');

    // Reset lit class on vertical candles - Candle 5 starts lit
    [n.c1, n.c2, n.c3, n.c4].forEach(function(c) {
      if(c) c.classList.remove('lit');
    });
    if (n.c5) n.c5.classList.add('lit');

    // ─── 0% to 15%: Candle 5 grows brighter (scale 1.0 -> 1.4) ───
    var s5 = 1.0;
    if (pct <= 15) {
      s5 = 1.0 + (pct / 15) * 0.4;
    } else {
      s5 = 1.4;
    }
    if (n.f5) {
      n.f5.style.transform = 'scale(' + s5 + ')';
      n.f5.style.opacity = '1';
    }

    // Leaning behavior for Candle 5 to reach Candle 4 wick (15% -> 25% lean, 36% -> 40% return)
    var rot5 = -32;
    if (pct > 15 && pct <= 25) {
      rot5 = -32 - ((pct - 15) / 10) * 12; // leans from -32 to -44
    } else if (pct > 25 && pct <= 36) {
      rot5 = -44; // holds touch briefly
    } else if (pct > 36 && pct <= 40) {
      rot5 = -44 + ((pct - 36) / 4) * 12; // returns to -32
    }
    if (n.c5) {
      n.c5.style.transform = 'rotate(' + rot5 + 'deg)';
    }

    // ─── 25%: Candle 4 ignites (25% -> 36% grow to 1.0) ───
    var s4 = 0;
    if (pct > 25 && pct <= 36) {
      s4 = (pct - 25) / 11;
    } else if (pct > 36) {
      s4 = 1.0;
    }
    if (n.f4) {
      n.f4.style.transform = 'scale(' + s4 + ')';
      n.f4.style.opacity = s4;
    }
    if (s4 > 0.1 && n.c4) n.c4.classList.add('lit');

    // ─── 40%: Candle 3 lights (40% -> 52% grow to 1.0) ───
    var s3 = 0;
    if (pct > 40 && pct <= 52) {
      s3 = (pct - 40) / 12;
    } else if (pct > 52) {
      s3 = 1.0;
    }
    if (n.f3) {
      n.f3.style.transform = 'scale(' + s3 + ')';
      n.f3.style.opacity = s3;
    }
    if (s3 > 0.1 && n.c3) n.c3.classList.add('lit');

    // ─── 60%: Candle 2 lights (60% -> 72% grow to 1.0) ───
    var s2 = 0;
    if (pct > 60 && pct <= 72) {
      s2 = (pct - 60) / 12;
    } else if (pct > 72) {
      s2 = 1.0;
    }
    if (n.f2) {
      n.f2.style.transform = 'scale(' + s2 + ')';
      n.f2.style.opacity = s2;
    }
    if (s2 > 0.1 && n.c2) n.c2.classList.add('lit');

    // ─── 80%: Candle 1 lights (80% -> 92% grow to 1.0) ───
    var s1 = 0;
    if (pct > 80 && pct <= 92) {
      s1 = (pct - 80) / 12;
    } else if (pct > 92) {
      s1 = 1.0;
    }
    if (n.f1) {
      n.f1.style.transform = 'scale(' + s1 + ')';
      n.f1.style.opacity = s1;
    }
    if (s1 > 0.1 && n.c1) n.c1.classList.add('lit');

    // Count how many candles are lit to drive motto reveal & ambient warmth
    var litCount = 1 + (s4 > 0.5 ? 1 : 0) + (s3 > 0.5 ? 1 : 0) + (s2 > 0.5 ? 1 : 0) + (s1 > 0.5 ? 1 : 0);
    
    // Motto reveal by candlelight: starts at 0.2, reaches 1.0 when all lit
    if (n.motto) {
      var mottoOpacity = 0.2 + (litCount - 1) * 0.2;
      n.motto.style.opacity = Math.min(1.0, mottoOpacity);
    }

    // Ambient glow & floor reflection pooling maps organically to scroll progress
    var glowProgress = Math.min(94, pct) / 94;
    if (n.bgAmbient) {
      n.bgAmbient.style.opacity = glowProgress * 0.85;
      n.bgAmbient.style.transform = 'scale(' + (0.7 + glowProgress * 0.3) + ')';
    }
    if (n.candlesGlow) {
      n.candlesGlow.style.opacity = 0.15 + glowProgress * 0.75;
    }
    if (n.floorScene) {
      n.floorScene.style.opacity = 0.02 + glowProgress * 0.03;
    }

    // ─── 94% to 100%: Dissolve & Morph ───
    var m = 0;
    if (pct >= 94) {
      m = Math.min(1, (pct - 94) / 6);
    }

    var mc = document.getElementById('main-content');
    var nb = document.getElementById('navbar');

    if (m > 0) {
      if (n.introWrap) n.introWrap.classList.add('show-bg');
      if (n.logoBg) n.logoBg.style.opacity = m;
      if (n.textGroup) {
        n.textGroup.style.opacity = 1 - m;
        n.textGroup.style.transform = 'translateY(' + (-m * 20) + 'px)';
      }
      if (n.wrap) {
        n.wrap.style.opacity = 1 - m;
      }
      if (n.floorScene) {
        n.floorScene.style.opacity = (1 - m) * 0.05;
      }

      if (n.navLogo && n.introWrap) {
        if (!cachedNavRect) {
          cachedNavRect = n.navLogo.getBoundingClientRect();
        }
        if (cachedIntroWrapWidth === null) {
          cachedIntroWrapWidth = n.introWrap.offsetWidth || 240;
        }
        var r = cachedNavRect;
        var fromCX = window.innerWidth / 2;
        var fromCY = window.innerHeight / 2 - (window.innerHeight * 0.02);
        var toCX = r.left + r.width / 2;
        var toCY = r.top + r.height / 2;

        var dx = (toCX - fromCX) * m;
        var dy = (toCY - fromCY) * m;
        var targetWidth = r.width || 36;
        var startWidth = cachedIntroWrapWidth;
        var sc = 1 - m * (1 - targetWidth / startWidth);

        n.introWrap.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + sc + ')';
        n.introWrap.style.boxShadow = 'none';
      }

      if (mc) {
        mc.style.opacity = m;
        mc.style.visibility = m > 0 ? 'visible' : 'hidden';
        mc.style.transform = 'translateY(' + ((1 - m) * 40) + 'px)';
      }
      if (nb) {
        nb.style.opacity = m;
        nb.style.transform = 'translateY(' + (-100 + m * 100) + '%)';
      }
    } else {
      if (n.introWrap) {
        n.introWrap.classList.remove('show-bg');
        n.introWrap.style.transform = 'none';
      }
      if (n.logoBg) n.logoBg.style.opacity = 0;
      if (n.textGroup) {
        n.textGroup.style.opacity = 1;
        n.textGroup.style.transform = 'none';
      }
      if (n.wrap) {
        n.wrap.style.opacity = 1;
      }
      if (mc) {
        mc.style.opacity = 0;
        mc.style.visibility = 'hidden';
        mc.style.transform = 'translateY(40px)';
      }
      if (nb) {
        nb.style.opacity = 0;
        nb.style.transform = 'translateY(-100%)';
      }
    }
  }

  /* ── Complete / Skip ── */
  function finish(overlay, stopParticles, isSkip) {
    overlay.style.display='none'; overlay.setAttribute('aria-hidden','true');
    var sp=document.getElementById('prologue-spacer'); if(sp) sp.remove();
    document.body.classList.remove('prologue-active');
    window.scrollTo(0,0);
    document.body.classList.add(isSkip?'intro-skip':'intro-complete');
    if(stopParticles) stopParticles();
    if(resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    cachedNavRect = null;
    cachedIntroWrapWidth = null;
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
      floorScene:overlay.querySelector('.floor-scene')
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

    var isFinished=false, rafPending=false;

    function onScroll(){
      if(isFinished||rafPending) return;
      rafPending=true;
      requestAnimationFrame(function(){
        rafPending=false;
        if(isFinished) return;
        var maxScroll = window.innerHeight;
        var sv = Math.min(window.scrollY, maxScroll);
        var scrollPercent = (sv / maxScroll) * 100;
        
        render(scrollPercent,n);
        
        if(sv >= maxScroll - 5){
          isFinished=true;
          window.removeEventListener('scroll',onScroll);
          setTimeout(function(){ finish(overlay,stopParticles,false); },150);
        }
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true});

    resizeHandler = function onResize() {
      cachedNavRect = null;
      cachedIntroWrapWidth = null;
      var sp = document.getElementById('prologue-spacer');
      if (sp) {
        sp.style.height = window.innerHeight + 'px';
      }
    };
    window.addEventListener('resize', resizeHandler, {passive:true});
    resizeHandler(); // initial call

    function doSkip(){
      if(isFinished) return; isFinished=true;
      window.removeEventListener('scroll',onScroll);
      finish(overlay,stopParticles,true);
    }
    overlay.addEventListener('click', doSkip, {once: true});

    window.addEventListener('keydown',function(e){
      if(isFinished) return;
      if(['ArrowDown',' ','PageDown'].indexOf(e.key)>-1){e.preventDefault();window.scrollBy({top:120,behavior:'smooth'});}
      else if(['ArrowUp','PageUp'].indexOf(e.key)>-1){e.preventDefault();window.scrollBy({top:-120,behavior:'smooth'});}
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initIntro);
  } else {
    initIntro();
  }

})();
