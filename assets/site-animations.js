(function () {
  var motionReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }
    fn();
  }

  function disableLegacyTildaAnimations() {
    var animatedNodes = document.querySelectorAll('.t-animate, [data-animate-style], [data-animate-group], [data-animate-chain]');

    animatedNodes.forEach(function (node) {
      node.classList.remove('t-animate_started', 't-animate__chain_showed', 't-animate__chain_first-in-row');
      if (node.classList.contains('t-animate')) node.classList.remove('t-animate');
      node.removeAttribute('data-animate-style');
      node.removeAttribute('data-animate-group');
      node.removeAttribute('data-animate-order');
      node.removeAttribute('data-animate-delay');
      node.removeAttribute('data-animate-chain');
      node.removeAttribute('data-animate-start-time');
      if (node.style && node.style.transitionDelay) node.style.transitionDelay = '';
    });
  }

  function buildTargets(definitions) {
    var targets = [];

    definitions.forEach(function (definition) {
      var nodes = document.querySelectorAll(definition.selector);

      nodes.forEach(function (node, index) {
        node.classList.add(definition.hero ? 'js-hero-seq' : 'js-reveal');
        if (definition.variant) node.classList.add(definition.variant);

        var delay = (definition.baseDelay || 0) + (definition.delayStep || 0) * index;
        node.style.setProperty('--reveal-delay', delay + 'ms');
        targets.push(node);
      });
    });

    return targets;
  }

  function revealImmediately(nodes) {
    nodes.forEach(function (node) {
      node.classList.add('is-visible');
    });
  }

  function revealHeroSequence() {
    document.querySelectorAll('.js-hero-seq').forEach(function (node) {
      var delay = parseInt(node.style.getPropertyValue('--reveal-delay'), 10) || 0;
      window.setTimeout(function () {
        node.classList.add('is-visible');
      }, delay);
    });
  }

  function observeInView(nodes) {
    if (!('IntersectionObserver' in window) || motionReduced) {
      revealImmediately(nodes);
      return { fallback: true, observedCount: nodes.length };
    }

    var observer = new IntersectionObserver(
      function (entries, io) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    nodes.forEach(function (node) {
      if (!node.classList.contains('js-hero-seq')) observer.observe(node);
    });

    return { fallback: false, observedCount: nodes.length };
  }

  onReady(function () {
    disableLegacyTildaAnimations();

    var targets = buildTargets([
      { selector: '#rec2143512671 .t182__title', hero: true, baseDelay: 0 },
      { selector: '#rec2143512671 .t182__descr', hero: true, baseDelay: 120 },
      { selector: '#rec2143512671 .t182__brand', hero: true, baseDelay: 220 },
      { selector: '#rec2143512671 .t182__buttons .t-btn', hero: true, baseDelay: 280, delayStep: 70, variant: 'reveal-right' },

      { selector: '#rec2143951791 .t-card__col', delayStep: 70, variant: 'reveal-scale' },
      { selector: '#rec2144698701 .t603__tile', delayStep: 60 },
      { selector: '#rec2144370191 .t-card__col', delayStep: 55, variant: 'reveal-scale' },

      { selector: '#rec2144564801 .t722__title', variant: 'reveal-left' },
      { selector: '#rec2144564801 .t722__descr', baseDelay: 70 },
      { selector: '#rec2144564801 .lead-form', baseDelay: 120, variant: 'reveal-scale' },
      { selector: '#rec2144564801 .t722__hint', baseDelay: 180 },

      { selector: '.t-popup .t-popup__container', variant: 'reveal-scale' }
    ]);

    if (!targets.length) return;

    document.documentElement.classList.add('animations-enabled');

    requestAnimationFrame(function () {
      document.documentElement.classList.add('animations-ready');
      revealHeroSequence();
    });

    var observerState = observeInView(targets);
    window.__ralumaAnimations = {
      initializedAt: new Date().toISOString(),
      reducedMotion: motionReduced,
      targets: targets.length,
      observer: observerState
    };
  });
})();
