(function () {
  var PHONE_DISPLAY = '+7 (812) 330-74-15';
  var PHONE_HREF = 'tel:+78123307415';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }
    fn();
  }

  function normalizePhone(raw) {
    var digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return '';

    if (digits.length === 11 && digits.charAt(0) === '8') {
      digits = '7' + digits.slice(1);
    }

    return (digits.charAt(0) === '7' ? '+' : '') + digits;
  }

  function isValidPhone(phone) {
    return /^\+?\d{10,15}$/.test(phone);
  }

  function setStatus(box, text, isError) {
    if (!box) return;

    box.textContent = text;
    box.style.display = 'block';
    box.style.color = isError ? '#b00020' : '#0a7a1c';
    box.style.textAlign = 'center';
    box.style.fontFamily = 'Montserrat, Arial, sans-serif';
    box.style.fontSize = '18px';
    box.style.fontWeight = isError ? '500' : '600';
  }

  function setButtonBusy(button, isBusy) {
    if (!button) return;

    var textNode = button.querySelector('.t-btnflex__text');
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = textNode ? textNode.textContent : 'Отправить';
    }

    button.disabled = isBusy;
    button.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    button.style.opacity = isBusy ? '0.7' : '';

    if (textNode) {
      textNode.textContent = isBusy ? 'Отправка...' : button.dataset.originalLabel;
    }
  }

  function attachLeadFormHandler(form) {
    if (form.dataset.hardened === '1') return;
    form.dataset.hardened = '1';

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (form.dataset.submitting === '1') return;

      var successBox = form.querySelector('.js-successbox');
      var button = form.querySelector('button[type="submit"]');
      var nameInput = form.querySelector('input[name="name"]');
      var phoneInput = form.querySelector('input[name="phone"]');

      if (successBox) successBox.style.display = 'none';

      var name = ((nameInput && nameInput.value) || '').trim();
      var phone = normalizePhone((phoneInput && phoneInput.value) || '');

      if (name.length < 2) {
        setStatus(successBox, 'Введите имя (минимум 2 символа).', true);
        return;
      }

      if (!isValidPhone(phone)) {
        setStatus(successBox, 'Введите корректный номер телефона в формате +79991234567.', true);
        return;
      }

      form.dataset.submitting = '1';
      setButtonBusy(button, true);

      var data = new FormData(form);
      data.set('name', name);
      data.set('phone', phone);
      data.set('page_url', window.location.href);
      data.set('page_title', document.title);

      try {
        var response = await fetch(form.getAttribute('action') || 'https://formspree.io/f/mjgpywnr', {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          throw new Error('request_failed');
        }

        window.setTimeout(function () {
          window.location.href = '/thanks.html';
        }, 400);
      } catch (error) {
        setStatus(successBox, 'Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз.', true);
        form.dataset.submitting = '0';
        setButtonBusy(button, false);
      }
    });
  }

  function injectCallUxStyles() {
    if (document.getElementById('raluma-call-ux-style')) return;

    var style = document.createElement('style');
    style.id = 'raluma-call-ux-style';
    style.textContent = [
      ':root{--raluma-callbar-height:74px;--raluma-mobile-bar-height:76px;--bottom-bar-height:76px;--raluma-mobile-safe-gap:14px;--raluma-mobile-scrollup-size:50px;--raluma-mobile-scrollup-gap:12px;--raluma-anchor-offset-mobile:18px;--raluma-anchor-offset-desktop:92px;}',
      '.raluma-callbar{position:fixed;top:18px;right:20px;left:auto;z-index:990;background:#ffffff;border:1px solid rgba(11,24,43,0.16);box-shadow:0 10px 26px rgba(11,24,43,0.12);border-radius:16px;padding:12px 14px;min-width:320px;max-width:min(420px,calc(100vw - 40px));transition:border-color .24s ease,box-shadow .24s ease,transform .24s ease;}',
      '.raluma-callbar__inner{display:flex;flex-direction:column;gap:0;}',
      '.raluma-callbar__mainline{display:flex;align-items:center;justify-content:space-between;gap:14px;}',
      '.raluma-callbar__phone{font-size:23px;line-height:1.2;font-weight:600;color:#111;text-decoration:none;letter-spacing:0.01em;transition:color .2s ease;white-space:nowrap;}',
      '.raluma-callbar__hours{display:block;max-height:0;opacity:0;overflow:hidden;margin-top:0;font-size:12px;line-height:1.3;color:rgba(17,17,17,0.64);transition:max-height .24s ease,opacity .18s ease,margin-top .24s ease;}',
      '.raluma-callbar__cta{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 20px;border-radius:999px;border:1px solid rgba(11,24,43,0.24);background:#ffffff;color:#111;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;text-decoration:none;white-space:nowrap;transition:all .2s ease;}',
      '.raluma-callbar__phone:hover,.raluma-callbar__phone:focus-visible{color:#d40000;outline:none;}',
      '.raluma-callbar__cta:hover,.raluma-callbar__cta:focus-visible{background:#111;color:#fff;border-color:#111;outline:none;}',
      '.raluma-callbar__cta:active{transform:translateY(1px);}',
      '.raluma-callbar.is-scrolled{border-color:rgba(11,24,43,0.22);box-shadow:0 12px 30px rgba(11,24,43,0.16);}',
      '.raluma-callbar.is-scrolled .raluma-callbar__hours{max-height:20px;opacity:1;margin-top:8px;}',
      '.raluma-callbar.is-scrolled .raluma-callbar__cta{background:#111;color:#fff;border-color:#111;}',
      '.raluma-callbar.is-scrolled .raluma-callbar__cta:hover,.raluma-callbar.is-scrolled .raluma-callbar__cta:focus-visible{background:#2d3949;border-color:#2d3949;color:#fff;}',
      '.raluma-mobile-actions{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:994;display:none;background:rgba(255,255,255,0.96);backdrop-filter:blur(10px);padding:8px;border:1px solid rgba(11,24,43,0.1);border-radius:18px;box-shadow:0 10px 28px rgba(11,24,43,0.18);gap:8px;}',
      '.raluma-mobile-actions__btn{flex:1;display:flex;align-items:center;justify-content:center;min-height:52px;padding:0 12px;border-radius:12px;text-decoration:none;font-size:14px;line-height:1.2;font-weight:600;border:1px solid transparent;}',
      '.raluma-mobile-actions__btn--call{color:#111;background:#fff;border-color:rgba(17,17,17,0.18);}',
      '.raluma-mobile-actions__btn--calc{color:#fff;background:#ff0000;max-width:280px;opacity:1;transform:translateX(0);transition:max-width .22s ease,opacity .18s ease,transform .22s ease,padding .22s ease,margin .22s ease,border-width .22s ease;}',
      '.raluma-mobile-actions.is-form-zone .raluma-mobile-actions__btn--calc{max-width:0;opacity:0;transform:translateX(10px);padding-left:0;padding-right:0;margin:0;border-width:0;overflow:hidden;pointer-events:none;}',
      '.raluma-mobile-actions.is-form-zone .raluma-mobile-actions__btn--call{flex:1 1 100%;}',
      '.raluma-mobile-actions__btn:focus-visible{outline:2px solid #111;outline-offset:1px;}',
      '.raluma-mobile-actions__btn:active{transform:translateY(1px);}',
      'section#lead-form{scroll-margin-top:var(--raluma-anchor-offset-desktop);}',
      '#cases-prices{scroll-margin-top:var(--raluma-anchor-offset-desktop);}',
      '@media screen and (min-width:981px){body{padding-top:0;}#rec2145215921 .t890{bottom:20px;} }',
      '@media screen and (max-width:980px){.raluma-callbar{display:none!important;}.raluma-mobile-actions{display:flex;}body{padding-bottom:calc(var(--raluma-mobile-bar-height) + env(safe-area-inset-bottom) + 22px);}#rec2145215921 .t890{z-index:993;bottom:calc(var(--raluma-mobile-bar-height) + env(safe-area-inset-bottom) + var(--raluma-mobile-safe-gap));}#rec2145452701 .t886{left:12px;right:12px!important;bottom:calc(var(--raluma-mobile-bar-height) + env(safe-area-inset-bottom) + var(--raluma-mobile-safe-gap) + var(--raluma-mobile-scrollup-size) + var(--raluma-mobile-scrollup-gap));z-index:992;}#rec2145452701 .t886__wrapper{width:100%!important;max-width:100%!important;box-sizing:border-box;}#rec2145452701 .t886.raluma-cookie-pending{opacity:0;visibility:hidden;pointer-events:none;}section#lead-form{scroll-margin-top:var(--raluma-anchor-offset-mobile);}#cases-prices{scroll-margin-top:var(--raluma-anchor-offset-mobile);} }',
      '@media screen and (max-width:1200px){.raluma-callbar{top:14px;right:14px;min-width:290px;}}',
      '@media screen and (max-width:640px){#rec2143512671 .t182__buttons{margin-top:28px;}}',
      '@media screen and (max-width:767px){#rec2143512671 .t182__content-wrapper{max-width:330px;}#rec2143512671 .t182__title{margin-bottom:12px;}#rec2143512671 .t182__descr{font-size:15px;line-height:1.42;max-width:320px;white-space:normal;text-wrap:balance;margin-left:auto;margin-right:auto;}#rec2143512671 .t182__descr br{display:none;}#rec2143512671 .t182__brand{display:none;}#rec2143512671 .t182__buttons{margin-top:16px;justify-content:center;}#rec2143512671 .t-btnflex_type_button{display:none!important;}#rec2143512671 .t182__wrapper{padding-bottom:calc(var(--bottom-bar-height) + env(safe-area-inset-bottom) + 28px);} }'
    ].join('');

    document.head.appendChild(style);
  }

  function insertDesktopStickyCallbar() {
    if (document.querySelector('.raluma-callbar')) return;

    var bar = document.createElement('div');
    bar.className = 'raluma-callbar';
    bar.innerHTML =
      '<div class="raluma-callbar__inner">' +
      '  <div class="raluma-callbar__mainline">' +
      '    <a class="raluma-callbar__phone" href="' + PHONE_HREF + '" aria-label="Позвонить по номеру +7 (812) 330-74-15">' + PHONE_DISPLAY + '</a>' +
      '    <a class="raluma-callbar__cta" href="' + PHONE_HREF + '" aria-label="Позвонить по номеру +7 (812) 330-74-15">Позвонить</a>' +
      '  </div>' +
      '  <span class="raluma-callbar__hours">Ежедневно 9:00–21:00</span>' +
      '</div>';

    document.body.appendChild(bar);
  }

  function setupCallbarStateListener() {
    var callbar = document.querySelector('.raluma-callbar');
    if (!callbar) return;

    var threshold = 64;

    function syncState() {
      if (window.matchMedia('(max-width: 980px)').matches) {
        callbar.classList.remove('is-scrolled');
        return;
      }

      callbar.classList.toggle('is-scrolled', window.scrollY >= threshold);
    }

    syncState();
    window.addEventListener('scroll', syncState, { passive: true });
    window.addEventListener('resize', syncState);
  }

  function scrollToLeadForm() {
    var target = document.getElementById('lead-form') || document.getElementById('rec2144564801');
    if (!target) return;

    var headerOffset = window.matchMedia('(min-width: 981px)').matches ? 88 : 16;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });
  }

  function insertMobileActionBar() {
    if (document.querySelector('.raluma-mobile-actions')) return;

    var bar = document.createElement('nav');
    bar.className = 'raluma-mobile-actions';
    bar.setAttribute('aria-label', 'Быстрые действия');
    bar.innerHTML =
      '<a class="raluma-mobile-actions__btn raluma-mobile-actions__btn--call" href="' + PHONE_HREF + '" aria-label="Позвонить по номеру +7 (812) 330-74-15">Позвонить</a>' +
      '<a class="raluma-mobile-actions__btn raluma-mobile-actions__btn--calc" href="#lead-form">Рассчитать стоимость</a>';

    var calcButton = bar.querySelector('.raluma-mobile-actions__btn--calc');
    if (calcButton) {
      calcButton.addEventListener('click', function (event) {
        event.preventDefault();
        scrollToLeadForm();
      });
    }

    document.body.appendChild(bar);

    return bar;
  }

  function syncMobileOffsets(actionBar) {
    function update() {
      if (!actionBar || !window.matchMedia('(max-width: 980px)').matches) return;
      var height = actionBar.offsetHeight || 76;
      document.documentElement.style.setProperty('--raluma-mobile-bar-height', height + 'px');
      document.documentElement.style.setProperty('--bottom-bar-height', height + 'px');
    }

    update();
    window.addEventListener('resize', update);
  }

  function setupContextMobileBar(actionBar) {
    if (!actionBar) return;

    var leadSection = document.getElementById('lead-form');
    if (!leadSection || typeof window.IntersectionObserver !== 'function') return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          actionBar.classList.toggle('is-form-zone', entry.isIntersecting || entry.intersectionRatio > 0);
        });
      },
      {
        root: null,
        threshold: [0, 0.15, 0.3],
        rootMargin: '0px 0px -20% 0px'
      }
    );

    observer.observe(leadSection);
  }

  function setupAnchorTargets() {
    var leadLinks = document.querySelectorAll('a[href="#rec2144564801"], a[href="#lead-form"]');
    leadLinks.forEach(function (link) {
      var txt = (link.textContent || '').trim();
      if (txt.indexOf('Рассчитать стоимость') === -1) return;
      link.setAttribute('href', '#lead-form');
      link.addEventListener('click', function (event) {
        event.preventDefault();
        scrollToLeadForm();
      });
    });
  }

  function setupDeferredCookieBanner(actionBar) {
    var cookieBanner = document.querySelector('#rec2145452701 .t886');
    if (!cookieBanner) return;
    if (!window.matchMedia('(max-width: 980px)').matches) return;

    var storageKey = cookieBanner.getAttribute('data-storage-item');
    var isAccepted = false;
    if (storageKey) {
      try {
        isAccepted =
          window.localStorage.getItem(storageKey) === '1' ||
          window.localStorage.getItem(storageKey) === 'true' ||
          document.cookie.indexOf(storageKey + '=1') !== -1 ||
          document.cookie.indexOf(storageKey + '=true') !== -1;
      } catch (error) {
        isAccepted = document.cookie.indexOf(storageKey + '=1') !== -1 || document.cookie.indexOf(storageKey + '=true') !== -1;
      }
    }
    if (isAccepted) return;

    cookieBanner.classList.add('raluma-cookie-pending');
    var threshold = 56;
    var maxScrollY = window.scrollY || 0;
    var triggered = false;

    function revealCookieBanner() {
      if (triggered) return;
      triggered = true;
      cookieBanner.classList.remove('raluma-cookie-pending');
      cookieBanner.classList.remove('t886_closed');
      window.removeEventListener('scroll', onScroll, { passive: true });
      if (actionBar) {
        document.documentElement.style.setProperty('--raluma-mobile-bar-height', (actionBar.offsetHeight || 76) + 'px');
      }
    }

    function onScroll() {
      var currentY = window.scrollY || 0;
      if (currentY > maxScrollY) maxScrollY = currentY;
      if (maxScrollY >= threshold) revealCookieBanner();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  onReady(function () {
    document.querySelectorAll('form.lead-form').forEach(attachLeadFormHandler);

    var cookieWrapper = document.querySelector('#rec2145452701 .t886__wrapper');
    if (cookieWrapper) cookieWrapper.style.maxWidth = 'calc(100vw - 32px)';

    injectCallUxStyles();
    insertDesktopStickyCallbar();
    setupCallbarStateListener();
    var mobileBar = insertMobileActionBar();
    syncMobileOffsets(mobileBar);
    setupContextMobileBar(mobileBar);
    setupAnchorTargets();
    setupDeferredCookieBanner(mobileBar);

    if (typeof window.t_prod__init !== 'function') {
      window.t_prod__init = function () {};
    }
  });
})();
