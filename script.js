/* ============================================
   FREE YOUR SKILL AGENCY — MOCKUP JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- HEADER SCROLL EFFECT ----
  const header = document.getElementById('header');

  if (header) {
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- MOBILE NAV ----
  const burger = document.querySelector('.header__burger');
  const mobileNav = document.getElementById('mobileNav');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- REVEAL ON SCROLL (IntersectionObserver) ----
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.02, rootMargin: '0px 0px 0px 0px' });

      revealEls.forEach(el => revealObserver.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('revealed'));
    }
  }

  // ---- FAQ ACCORDION ----
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  // ---- SMOOTH SCROLL for anchor links (only for same-page anchors) ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return; // skip placeholder links
      const target = document.querySelector(href);
      if (target && header) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- PARALLAX EFFECT (subtle) ----
  const parallaxImages = document.querySelectorAll('.parallax-divider__img');
  if (parallaxImages.length) {
    window.addEventListener('scroll', () => {
      parallaxImages.forEach(img => {
        const rect = img.parentElement.getBoundingClientRect();
        const windowH = window.innerHeight;
        if (rect.top < windowH && rect.bottom > 0) {
          const progress = (windowH - rect.top) / (windowH + rect.height);
          img.style.transform = `translateY(${(progress - 0.5) * -80}px)`;
        }
      });
    }, { passive: true });
  }

});
