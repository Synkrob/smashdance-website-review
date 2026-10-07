(() => {
  const initializeNavigation = (header) => {
    if (!header || header.dataset.navigationReady === 'true') return;
    header.dataset.navigationReady = 'true';

    const drops = Array.from(header.querySelectorAll('.nav-drop'));
    drops.forEach((drop) => {
      const link = drop.querySelector(':scope > a[href="#"]');
      if (!link) return;
      const toggle = document.createElement('button');
      toggle.className = 'nav-drop-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = link.innerHTML;
      link.replaceWith(toggle);
    });

    const closeDrops = (except) => {
      drops.forEach((drop) => {
        if (drop === except) return;
        drop.classList.remove('is-open');
        drop.querySelector('.nav-drop-toggle')?.setAttribute('aria-expanded', 'false');
      });
    };

    drops.forEach((drop) => {
      const toggle = drop.querySelector('.nav-drop-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', () => {
        const willOpen = !drop.classList.contains('is-open');
        closeDrops(drop);
        drop.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', String(willOpen));
      });
    });

    header.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-drop')) closeDrops();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDrops();
    });
  };

  window.initializeSmashNavigation = initializeNavigation;
  document.querySelectorAll('.site-header').forEach(initializeNavigation);
  new MutationObserver(() => document.querySelectorAll('.site-header').forEach(initializeNavigation))
    .observe(document.documentElement, { childList: true, subtree: true });
})();
