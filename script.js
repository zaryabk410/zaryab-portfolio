/* Zaryab Khan — portfolio interactions */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- Split text into characters ---------- */
  $$('.split').forEach(el => {
    const words = el.textContent.split(' ');
    el.textContent = '';
    words.forEach((w, wi) => {
      const word = document.createElement('span');
      word.className = 'wd';
      [...w].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        word.appendChild(s);
      });
      el.appendChild(word);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    try {
      lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      if (hasGSAP) {
        lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    } catch (e) { lenis = null; }
  }
  // anchor links go through Lenis when present
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -80 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- Preloader: fake Odoo server log ---------- */
  const logLines = [
    'odoo.service.server: HTTP service running on riyadh:8069',
    'odoo.modules.loading: loading 1 modules...',
    'odoo.modules.loading: loading zaryab_portfolio (v18.0)',
    'odoo.modules.registry: 14 projects, 8 clients registered',
    'odoo.addons.flutter_bridge: JSON-RPC handshake ok',
  ];
  const loader = $('#loader'), logEl = $('#loaderLog'), numEl = $('#loaderNum'), barEl = $('#loaderBar');
  function runLoader(done) {
    if (reduce || !loader) { loader && loader.remove(); done(); return; }
    let p = 0, shown = 0, loaded = document.readyState === 'complete';
    window.addEventListener('load', () => { loaded = true; });
    const start = performance.now();
    const tick = now => {
      const elapsed = now - start;
      const cap = loaded ? 100 : 90;
      p = Math.min(cap, p + (cap - p) * 0.06 + 0.4);
      if (elapsed < 1800) p = Math.min(p, elapsed / 18);
      const v = Math.floor(p);
      numEl.textContent = v;
      barEl.style.width = v + '%';
      const want = Math.min(logLines.length, Math.floor(v / 20) + 1);
      while (shown < want) {
        const line = document.createElement('div');
        line.innerHTML = `<span class="ok">INFO</span> ${logLines[shown]}`;
        logEl.appendChild(line); shown++;
      }
      if (v >= 100) {
        const ready = document.createElement('div');
        ready.innerHTML = '<span class="ok">READY</span> Welcome.';
        logEl.appendChild(ready);
        setTimeout(() => done(), 250);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { loaded = true; }, 4500); // never hang on slow assets
  }

  /* ---------- Intro sequence after loader ---------- */
  const portrait = $('#portrait');
  function intro() {
    document.body.classList.remove('is-loading');
    if (!hasGSAP || reduce) {
      loader && loader.remove();
      portrait && portrait.classList.add('play', 'ready');
      countUp();
      initScroll();
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', onComplete: () => loader.remove() })
      .from('.hero-title .ch', { yPercent: 110, rotate: 6, duration: 1.2, stagger: 0.04 }, '-=0.45')
      .add(() => portrait.classList.add('play'), '<')
      .from('.hero-hello', { y: 20, opacity: 0, duration: .8 }, '<0.2')
      .from(['.hero-role', '.hero-actions', '.hero-stats'], { y: 30, opacity: 0, duration: 1, stagger: .12 }, '<0.3')
      .from('.badge', { scale: 0, rotate: -120, duration: 1.2, ease: 'back.out(1.6)' }, '<0.2')
      .from('.float-chip', { scale: .6, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(2)' }, '<0.3')
      .add(countUp, '<')
      .add(() => setTimeout(() => portrait.classList.add('ready'), 2600));
    initScroll();
  }
  runLoader(intro);

  /* ---------- Counters ---------- */
  function countUp() {
    $$('.count').forEach(el => {
      const to = +el.dataset.to;
      if (reduce) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 1400;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Riyadh clock ---------- */
  const clock = $('#clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Riyadh' });
  const tickClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  tickClock(); setInterval(tickClock, 15000);
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Nav: hide on scroll down, active section ---------- */
  const nav = $('#nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('hide', y > lastY && y > 400 && !menu.classList.contains('open'));
    lastY = y;
  }, { passive: true });
  const links = $$('.nav-links a');
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), menu = $('#mobileMenu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Rotating role ---------- */
  const words = ['Odoo modules', 'Flutter apps', 'client portals', 'HR systems', 'API bridges', 'ERP rollouts'];
  const rot = $('#rotWord');
  if (rot && !reduce) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      if (hasGSAP) {
        gsap.to(rot, { yPercent: -100, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => {
          rot.textContent = words[i];
          gsap.fromTo(rot, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: 'expo.out' });
        } });
      } else rot.textContent = words[i];
    }, 2400);
  }

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (fine && !reduce) {
    const cur = $('#cursor');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * .22; cy += (ty - cy) * .22;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$('a,button,summary,.tile,.card').forEach(el => {
      el.addEventListener('pointerenter', () => cur.classList.add('big'));
      el.addEventListener('pointerleave', () => cur.classList.remove('big'));
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .35;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 500);
      });
    });
  }

  /* ---------- Portrait lens: reveal the real photo under the cursor ---------- */
  if (portrait && fine) {
    let r = 0, target = 0, x = 50, y = 40, tx = 50, ty = 40, running = false;
    const animate = () => {
      r += (target - r) * .14; x += (tx - x) * .2; y += (ty - y) * .2;
      portrait.style.setProperty('--r', r.toFixed(1) + 'px');
      portrait.style.setProperty('--x', x.toFixed(2) + '%');
      portrait.style.setProperty('--y', y.toFixed(2) + '%');
      if (Math.abs(target - r) > .3 || Math.abs(tx - x) > .05 || Math.abs(ty - y) > .05) requestAnimationFrame(animate);
      else running = false;
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(animate); } };
    portrait.addEventListener('pointerenter', () => { target = portrait.offsetWidth * .26; portrait.classList.add('lens'); kick(); });
    portrait.addEventListener('pointerleave', () => { target = 0; portrait.classList.remove('lens'); kick(); });
    portrait.addEventListener('pointermove', e => {
      const b = portrait.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width) * 100; ty = ((e.clientY - b.top) / b.height) * 100; kick();
    });
  } else if (portrait) {
    // touch: tap toggles the photo
    portrait.addEventListener('click', () => {
      const on = portrait.style.getPropertyValue('--r') !== '2000px';
      portrait.style.setProperty('--x', '50%'); portrait.style.setProperty('--y', '40%');
      portrait.style.setProperty('--r', on ? '2000px' : '0px');
    });
  }

  /* ---------- Experience accordion ---------- */
  $$('.xp-item').forEach(item => {
    const btn = $('.xp-row', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 650);
    });
  });

  /* ---------- Project filters ---------- */
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    $$('.filter').forEach(x => x.classList.toggle('active', x === b));
    const f = b.dataset.f;
    $$('.tile').forEach(t => {
      const show = f === 'all' || t.dataset.cat.split(' ').includes(f);
      t.classList.toggle('hidden', !show);
    });
    if (hasGSAP && !reduce) gsap.from('.tile:not(.hidden)', { y: 24, opacity: 0, duration: .6, stagger: .05, ease: 'expo.out' });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }));

  /* ---------- Copy email ---------- */
  const mailBtn = $('#copyMail'), mailState = $('#mailState');
  mailBtn.addEventListener('click', async () => {
    const m = mailBtn.dataset.mail;
    try { await navigator.clipboard.writeText(m); mailState.textContent = 'Copied to clipboard'; }
    catch { window.location.href = 'mailto:' + m; mailState.textContent = 'Opening your email app'; }
    setTimeout(() => (mailState.textContent = 'Copy email'), 2400);
  });

  /* ---------- Contact form → mailto ---------- */
  const form = $('#contactForm'), note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = [...form.elements].filter(el => el.name);
    let ok = true;
    fields.forEach(el => { const bad = !el.checkValidity() || !el.value.trim(); el.classList.toggle('invalid', bad); if (bad) ok = false; });
    if (!ok) { note.textContent = 'Fill in your name, a valid email and a short message.'; note.classList.add('err'); return; }
    note.classList.remove('err');
    const d = Object.fromEntries(new FormData(form));
    const subject = encodeURIComponent(`Project enquiry from ${d.name}`);
    const body = encodeURIComponent(`${d.msg}\n\n${d.name}\n${d.email}`);
    window.location.href = `mailto:zaryabkhan4011@gmail.com?subject=${subject}&body=${body}`;
    note.textContent = 'Your email app should open now. If it doesn\u2019t, copy the address on the left.';
  });

  /* ---------- Scroll-driven animation (GSAP) ---------- */
  function initScroll() {
    // About paragraph: split into words (runs even without GSAP so reduced-motion shows full text)
    const lead = $('#aboutLead');
    if (lead) lead.innerHTML = lead.textContent.split(/(\s+)/).map(w => /\s+/.test(w) ? w : `<span class="w">${w}</span>`).join('');

    if (!hasGSAP || reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

    // Hero parallax on exit
    gsap.to('.hero-visual', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-title', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Marquee: endless, speeds up with scroll velocity
    const track = $('#marquee');
    track.innerHTML += track.innerHTML;
    const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      onUpdate: self => {
        const v = self.getVelocity() / 300;
        gsap.to(loop, { timeScale: gsap.utils.clamp(-6, 6, 1 + Math.abs(v)) * (self.direction), duration: .2, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: .25, overwrite: false });
      }
    });

    // About words light up while reading
    gsap.to('#aboutLead .w', {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '#aboutLead', start: 'top 80%', end: 'bottom 45%', scrub: true }
    });

    // Journey: flight path draws, plane follows it
    const draw = $('#flightDraw');
    if (draw) {
      const len = draw.getTotalLength();
      gsap.set(draw, { strokeDasharray: len, strokeDashoffset: len });
      const jt = gsap.timeline({ scrollTrigger: { trigger: '.journey-stage', start: 'top 75%', end: 'center 40%', scrub: 1 } });
      jt.to(draw, { strokeDashoffset: 0, ease: 'none' }, 0);
      if (window.MotionPathPlugin) {
        jt.fromTo('#plane', { motionPath: { path: '#flightPath', align: '#flightPath', alignOrigin: [.5, .5], autoRotate: true, start: 0, end: 0 } },
          { motionPath: { path: '#flightPath', align: '#flightPath', alignOrigin: [.5, .5], autoRotate: true, start: 0, end: 1 }, ease: 'none' }, 0);
      }
      gsap.from('.j-pk', { x: -60, rotate: -6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.journey-stage', start: 'top 80%' } });
      gsap.from('.j-sa', { x: 60, rotate: 6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.journey-stage', start: 'center 70%' } });
    }

    // Stacked project cards: earlier cards shrink back as the next one lands
    const cards = $$('.card');
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.9 + i * 0.012, filter: 'brightness(.7)', ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top ' + (100 + (i + 1) * 16) + 'px', scrub: true }
      });
    });

    // Contact headline: single reveal
    gsap.from('.contact-title .ch', {
      yPercent: 100, opacity: 0, duration: 1, stagger: .025, ease: 'expo.out',
      scrollTrigger: { trigger: '.contact-title', start: 'top 80%' }
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
