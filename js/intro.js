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
  const MAX_SCROLL      = 1200;
  const PARTICLES_COUNT = 5;

  function shouldSkip() {
    return (
      sessionStorage.getItem(SESSION_KEY) === '1' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
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

  /* ── Scroll Render Engine ── */
  function render(sv, n) {
    if      (sv < 100)  setPhase(n.overlay, 'silhouettes');
    else if (sv < 930)  setPhase(n.overlay, 'lighting');
    else if (sv < 1050) setPhase(n.overlay, 'stable');
    else                setPhase(n.overlay, 'exiting');

    [n.c1,n.c2,n.c3,n.c4,n.c5].forEach(function(c){ if(c) c.classList.remove('lit','igniting','leaning'); });
    if (n.c5) n.c5.classList.add('lit');

    /* Candle 5 lean 100-250 */
    if (sv >= 100 && sv < 250) {
      var p = (sv-100)/150;
      if (n.c5) { n.c5.style.transform = 'rotate('+((-32)-(p*14))+'deg)'; n.c5.classList.add('leaning'); }
    } else { if (n.c5) n.c5.style.transform = 'rotate(-32deg)'; }

    /* Candle 4 ignites 250-330 */
    if (sv >= 250) {
      if (n.c4) n.c4.classList.add('lit');
      var p4 = Math.min(1,(sv-250)/80);
      if (n.f4) { n.f4.style.transform = 'scale('+p4+')'; n.f4.style.opacity = p4; }
      if (sv < 330) { var pR=(sv-250)/80; if(n.c5) n.c5.style.transform='rotate('+(-46+pR*14)+'deg)'; }
    } else { if (n.f4) { n.f4.style.transform='scale(0)'; n.f4.style.opacity=0; } }

    /* Candle 4 leans 330-450 */
    if (sv >= 330 && sv < 450) {
      var p = (sv-330)/120;
      if (n.c4) n.c4.classList.add('leaning');
      if (n.f4) n.f4.style.transform='rotate('+(-p*28)+'deg) scaleX('+(1+p*0.25)+') translateX('+(-p*4)+'px)';
    } else if (sv >= 450) {
      if (n.c4) n.c4.classList.remove('leaning');
      if (sv < 530) { var pR=(sv-450)/80; if(n.f4) n.f4.style.transform='rotate('+(-28+pR*28)+'deg) scaleX('+(1.25-pR*0.25)+') translateX('+(-4+pR*4)+'px)'; }
      else { if(n.f4) n.f4.style.transform='scale(1)'; }
    } else if (sv >= 250) { var p=(sv-250)/80; if(n.f4) n.f4.style.transform='scale('+p+')'; }

    /* Candle 3 ignites 450-530 */
    if (sv >= 450) {
      if (n.c3) n.c3.classList.add('lit');
      var p3=Math.min(1,(sv-450)/80);
      if(n.f3){n.f3.style.transform='scale('+p3+')';n.f3.style.opacity=p3;}
    } else { if(n.f3){n.f3.style.transform='scale(0)';n.f3.style.opacity=0;} }

    /* Candle 3 leans 530-650 */
    if (sv>=530&&sv<650){var p=(sv-530)/120;if(n.c3)n.c3.classList.add('leaning');if(n.f3)n.f3.style.transform='rotate('+(-p*28)+'deg) scaleX('+(1+p*0.25)+') translateX('+(-p*4)+'px)';}
    else if(sv>=650){if(n.c3)n.c3.classList.remove('leaning');if(sv<730){var pR=(sv-650)/80;if(n.f3)n.f3.style.transform='rotate('+(-28+pR*28)+'deg) scaleX('+(1.25-pR*0.25)+') translateX('+(-4+pR*4)+'px)';}else{if(n.f3)n.f3.style.transform='scale(1)';}}
    else if(sv>=450){var p=(sv-450)/80;if(n.f3)n.f3.style.transform='scale('+p+')';}

    /* Candle 2 ignites 650-730 */
    if(sv>=650){if(n.c2)n.c2.classList.add('lit');var p2=Math.min(1,(sv-650)/80);if(n.f2){n.f2.style.transform='scale('+p2+')';n.f2.style.opacity=p2;}}
    else{if(n.f2){n.f2.style.transform='scale(0)';n.f2.style.opacity=0;}}

    /* Candle 2 leans 730-850 */
    if(sv>=730&&sv<850){var p=(sv-730)/120;if(n.c2)n.c2.classList.add('leaning');if(n.f2)n.f2.style.transform='rotate('+(-p*28)+'deg) scaleX('+(1+p*0.25)+') translateX('+(-p*4)+'px)';}
    else if(sv>=850){if(n.c2)n.c2.classList.remove('leaning');if(sv<930){var pR=(sv-850)/80;if(n.f2)n.f2.style.transform='rotate('+(-28+pR*28)+'deg) scaleX('+(1.25-pR*0.25)+') translateX('+(-4+pR*4)+'px)';}else{if(n.f2)n.f2.style.transform='scale(1)';}}
    else if(sv>=650){var p=(sv-650)/80;if(n.f2)n.f2.style.transform='scale('+p+')';}

    /* Candle 1 ignites 850-930 */
    if(sv>=850){if(n.c1)n.c1.classList.add('lit');var p1=Math.min(1,(sv-850)/80);if(n.f1){n.f1.style.transform='scale('+p1+')';n.f1.style.opacity=p1;}}
    else{if(n.f1){n.f1.style.transform='scale(0)';n.f1.style.opacity=0;}}

    /* Parallax 0-1050 */
    if(sv<1050&&n.wrap) n.wrap.style.transform='translateY('+(sv*-0.015)+'px) scale(0.9)';

    /* Morph 1050-1200 */
    if(sv>=1050){
      var p=Math.min(1,(sv-1050)/150);
      if(n.introWrap)n.introWrap.classList.add('show-bg');
      if(n.logoBg)n.logoBg.style.opacity=p;
      if(n.textGroup){n.textGroup.style.opacity=1-p;n.textGroup.style.transform='translateY('+(-p*15)+'px)';}
      if(n.navLogo&&n.introWrap){
        var r=n.navLogo.getBoundingClientRect();
        var fromCX=window.innerWidth/2,fromCY=window.innerHeight/2;
        var toCX=r.left+r.width/2,toCY=r.top+r.height/2;
        var sc=1-p*(1-r.width/240);
        n.introWrap.style.transform='translate('+((toCX-fromCX)*p)+'px,'+((toCY-fromCY)*p)+'px) scale('+sc+')';
        n.introWrap.style.boxShadow='none';
        if(n.wrap)n.wrap.style.opacity=1-p;
      }
      var mc=document.getElementById('main-content'),nb=document.getElementById('navbar');
      if(mc){mc.style.opacity=p;mc.style.visibility=p>0?'visible':'hidden';}
      if(nb){nb.style.opacity=p;nb.style.transform='translateY('+(-100+p*100)+'%)';}
    } else {
      if(n.introWrap){n.introWrap.classList.remove('show-bg');n.introWrap.style.transform='none';}
      if(n.logoBg)n.logoBg.style.opacity=0;
      if(n.textGroup){n.textGroup.style.opacity=1;n.textGroup.style.transform='translateY(0)';}
      if(n.wrap)n.wrap.style.opacity=1;
      var mc=document.getElementById('main-content'),nb=document.getElementById('navbar');
      if(mc){mc.style.opacity=0;mc.style.visibility='hidden';}
      if(nb){nb.style.opacity=0;nb.style.transform='translateY(-100%)';}
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
    markShown();
    // Clear any inline styles set by render() so CSS class-based rules can take effect
    var mc=document.getElementById('main-content');
    var nb=document.getElementById('navbar');
    if(mc){ mc.style.opacity=''; mc.style.visibility=''; }
    if(nb){ nb.style.opacity=''; nb.style.transform=''; }
    setTimeout(function(){ dispatch('intro:complete'); }, 0);
  }

  /* ── Init ── */
  function initIntro() {
    var overlay=document.getElementById('intro-overlay');
    if(!overlay) return;

    if(shouldSkip()){
      var sp=document.getElementById('prologue-spacer'); if(sp) sp.remove();
      document.body.classList.remove('prologue-active');
      overlay.style.display='none'; overlay.setAttribute('aria-hidden','true');
      document.body.classList.add('intro-skip');
      markShown(); setTimeout(function(){ dispatch('intro:complete'); },0);
      return;
    }

    document.body.classList.add('prologue-active');

    var canvas=document.getElementById('intro-particles'), stopParticles=null;
    if(canvas){
      stopParticles=initParticles(canvas,function(){
        var lit=Array.from(overlay.querySelectorAll('.candle-g.lit'));
        if(!lit.length) return null;
        var wick=lit[Math.floor(Math.random()*lit.length)].querySelector('.candle-wick');
        if(!wick) return null;
        var r=wick.getBoundingClientRect(); return{x:r.left+r.width/2,y:r.top-2};
      });
    }

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
      navLogo:document.querySelector('.nav-logo-icon'),
    };
    n.f1=n.c1?n.c1.querySelector('.flame-g'):null;
    n.f2=n.c2?n.c2.querySelector('.flame-g'):null;
    n.f3=n.c3?n.c3.querySelector('.flame-g'):null;
    n.f4=n.c4?n.c4.querySelector('.flame-g'):null;
    n.f5=n.c5?n.c5.querySelector('.flame-g'):null;

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
        var sv=Math.min(window.scrollY,MAX_SCROLL);
        render(sv,n);
        if(sv>=MAX_SCROLL-5){
          isFinished=true;
          window.removeEventListener('scroll',onScroll);
          setTimeout(function(){ finish(overlay,stopParticles,false); },150);
        }
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true});

    function doSkip(){
      if(isFinished) return; isFinished=true;
      window.removeEventListener('scroll',onScroll);
      finish(overlay,stopParticles,true);
    }
    overlay.addEventListener('click',doSkip,{once:true});
    var hint=document.getElementById('intro-skip');
    if(hint) hint.addEventListener('click',function(e){e.stopPropagation();doSkip();},{once:true});

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
