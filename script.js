  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  // Skill bars animation
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const w = el.style.getPropertyValue('--w');
        setTimeout(() => {
          el.style.width = (parseFloat(w) * 100) + '%';
          el.classList.add('animated');
        }, 200);
        barObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => {
    const w = bar.style.getPropertyValue('--w');
    bar.style.width = (parseFloat(w) * 100) + '%';
    barObserver.observe(bar);
  });

  // Fix skill bar animation approach
  skillBars.forEach(bar => {
    const w = parseFloat(bar.style.getPropertyValue('--w') || '0');
    bar.dataset.target = w;
    bar.style.width = '0%';
    bar.style.transform = 'scaleX(1)';
  });

  const barObserver2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target) * 100;
        setTimeout(() => {
          el.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.width = target + '%';
        }, 300);
        barObserver2.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(bar => barObserver2.observe(bar));

  // Animate hero stats counter
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const update = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + '+';
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statNums = document.querySelectorAll('.stat-num');
  const targets = [2, 15, 8];
  setTimeout(() => {
    statNums.forEach((el, i) => animateCounter(el, targets[i], 1500));
  }, 1200);

  // Nav active state
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
    });
  });