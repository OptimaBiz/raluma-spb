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
      node.classList.remove('t-animate');
      node.removeAttribute('data-animate-style');
      node.removeAttribute('data-animate-group');
      node.removeAttribute('data-animate-order');
      node.removeAttribute('data-animate-delay');
      node.removeAttribute('data-animate-chain');
      node.removeAttribute('data-animate-start-time');
      if (node.style && node.style.transitionDelay) node.style.transitionDelay = '';
    });
  }

  function markRevealTargets(definitions) {
    definitions.forEach(function (definition) {
      var nodes = document.querySelectorAll(definition.selector);

      nodes.forEach(function (node, index) {
        node.classList.add(definition.hero ? 'js-hero-seq' : 'js-reveal');
        if (definition.variant) node.classList.add(definition.variant);

        var delay = (definition.baseDelay || 0) + (definition.delayStep || 0) * index;
        node.style.setProperty('--reveal-delay', delay + 'ms');
      });
    });
  }

  function getRevealNodes() {
    return Array.prototype.slice.call(document.querySelectorAll('.js-reveal, .js-hero-seq'));
  }

  function revealImmediately(nodes) {
    nodes.forEach(function (node) {
      node.classList.add('is-visible');
    });
  }

  function revealHeroSequence() {
    document.querySelectorAll('.js-hero-seq').forEach(function (node) {
      if (node.classList.contains('is-visible')) return;
      var delay = parseInt(node.style.getPropertyValue('--reveal-delay'), 10) || 0;
      window.setTimeout(function () {
        node.classList.add('is-visible');
      }, delay);
    });
  }

  function createObserver() {
    if (!('IntersectionObserver' in window) || motionReduced) return null;

    return new IntersectionObserver(
      function (entries, io) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
  }

  function observeNodes(observer, nodes) {
    if (!observer) {
      revealImmediately(nodes);
      return;
    }

    nodes.forEach(function (node) {
      if (node.classList.contains('js-hero-seq')) return;
      if (node.classList.contains('is-visible')) return;
      observer.observe(node);
    });
  }

  function watchDynamicNodes(observer) {
    if (!observer || !('MutationObserver' in window)) return;

    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (addedNode) {
          if (!(addedNode instanceof HTMLElement)) return;

          var dynamic = [];
          if (addedNode.matches && addedNode.matches('.t-popup.t-popup_show .t-popup__container')) {
            dynamic.push(addedNode.querySelector('.t-popup__container'));
          }

          if (addedNode.querySelectorAll) {
            addedNode.querySelectorAll('.t-popup.t-popup_show .t-popup__container').forEach(function (node) {
              dynamic.push(node);
            });
          }

          dynamic.forEach(function (node) {
            if (!node) return;
            node.classList.add('js-reveal', 'reveal-scale');
            node.style.setProperty('--reveal-delay', '0ms');
            observer.observe(node);
          });
        });
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

  onReady(function () {
    disableLegacyTildaAnimations();

    markRevealTargets([
      { selector: '#rec2143512671 .t182__title', hero: true, baseDelay: 0 },
      { selector: '#rec2143512671 .t182__descr', hero: true, baseDelay: 120 },
      { selector: '#rec2143512671 .t182__brand', hero: true, baseDelay: 220 },
      { selector: '#rec2143512671 .t182__buttons .t-btn', hero: true, baseDelay: 280, delayStep: 70, variant: 'reveal-right' },

      { selector: '#rec2143951791 .t772__col', delayStep: 60, variant: 'reveal-scale' },
      { selector: '#rec2144698701 .t603__tile', delayStep: 55 },
      { selector: '#rec2144370191 .t491__col', delayStep: 55, variant: 'reveal-scale' },
      { selector: '#rec2146001021 .raluma-process__step', delayStep: 55 },

      { selector: '#rec2144564801 .t722__title', variant: 'reveal-left' },
      { selector: '#rec2144564801 .t722__descr', baseDelay: 70 },
      { selector: '#rec2144564801 .lead-form', baseDelay: 120, variant: 'reveal-scale' },
      { selector: '#rec2144564801 .t722__hint', baseDelay: 180 },

      { selector: '#rec2145460381 .t463__col', delayStep: 45 },
      { selector: '.t-popup .t-popup__container', variant: 'reveal-scale' }
    ]);

    var targets = getRevealNodes();
    if (!targets.length) return;

    document.documentElement.classList.add('animations-enabled');

    requestAnimationFrame(function () {
      document.documentElement.classList.add('animations-ready');
      revealHeroSequence();
    });

    var observer = createObserver();
    observeNodes(observer, targets);
    watchDynamicNodes(observer);

    window.__ralumaAnimations = {
      initializedAt: new Date().toISOString(),
      reducedMotion: motionReduced,
      targets: targets.length,
      observerEnabled: Boolean(observer)
    };
  });
})();
