(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function addTargets(definitions) {
    var all = [];

    definitions.forEach(function (definition) {
      var nodes = document.querySelectorAll(definition.selector);
      nodes.forEach(function (node, index) {
        node.classList.add(definition.hero ? 'js-hero-seq' : 'js-reveal');
        if (definition.variant) node.classList.add(definition.variant);

        var delay = definition.delayStep ? index * definition.delayStep : 0;
        if (definition.baseDelay) delay += definition.baseDelay;
        node.style.setProperty('--reveal-delay', delay + 'ms');
        all.push(node);
      });
    });

    return all;
  }

  function setupObserver(nodes) {
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (node) {
        node.classList.add('is-visible');
      });
      return { observed: nodes.length, fallback: true };
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach(function (node) {
      if (!node.classList.contains('js-hero-seq')) {
        observer.observe(node);
      }
    });

    return { observed: nodes.length, fallback: false };
  }

  onReady(function () {
    document.documentElement.classList.add('animations-enabled');

    var targets = addTargets([
      { selector: '#rec2143512671 .t182__title', hero: true, baseDelay: 0 },
      { selector: '#rec2143512671 .t182__descr', hero: true, baseDelay: 140 },
      { selector: '#rec2143512671 .t182__buttons .t-btn', hero: true, baseDelay: 260, delayStep: 90, variant: 'reveal-right' },

      { selector: '#rec2143512671 .t-card__col', delayStep: 90, variant: 'reveal-scale' },
      { selector: '#rec2144698701 .t603__tile', delayStep: 70 },

      { selector: '#rec2144564801 .t722__title', variant: 'reveal-left' },
      { selector: '#rec2144564801 .t722__descr', baseDelay: 80 },
      { selector: '#rec2144564801 form.lead-form', baseDelay: 120, variant: 'reveal-scale' },
      { selector: '#rec2144564801 .t-form__submit', baseDelay: 180, variant: 'reveal-right' },
      { selector: '#rec2144564801 .t722__hint', baseDelay: 210 },

      { selector: '#rec2144564801 .t-input-group', delayStep: 60 },
      { selector: '.t-popup .t-popup__container', variant: 'reveal-scale' }
    ]);

    requestAnimationFrame(function () {
      document.documentElement.classList.add('animations-ready');
      document.querySelectorAll('.js-hero-seq').forEach(function (node) {
        setTimeout(function () {
          node.classList.add('is-visible');
        }, parseInt(node.style.getPropertyValue('--reveal-delay'), 10) || 0);
      });
    });

    var observerState = setupObserver(targets);
    window.__ralumaAnimations = {
      totalTargets: targets.length,
      observerState: observerState,
      initializedAt: new Date().toISOString()
    };
  });
})();
