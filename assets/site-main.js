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
      ':root{--raluma-callbar-height:74px;--raluma-mobile-bar-height:76px;--bottom-bar-height:0px;--raluma-anchor-offset-mobile:18px;--raluma-anchor-offset-desktop:92px;--raluma-safe-area-bottom:env(safe-area-inset-bottom,0px);--raluma-floating-gap:20px;--raluma-floating-stack-gap:12px;--raluma-scrollup-size:50px;--raluma-bottom-layer-height:0px;--raluma-mobile-actions-bottom-offset:0px;--raluma-scroll-up-offset:calc(var(--raluma-bottom-layer-height) + var(--raluma-safe-area-bottom) + var(--raluma-floating-gap) + var(--raluma-mobile-actions-bottom-offset));--raluma-cookies-trigger-offset:calc(var(--raluma-scroll-up-offset) + var(--raluma-scrollup-size) + var(--raluma-floating-stack-gap));}',
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
      '.raluma-mobile-actions{position:fixed;left:12px;right:12px;bottom:calc(12px + var(--raluma-safe-area-bottom));z-index:1000;display:none;background:rgba(255,255,255,0.96);backdrop-filter:blur(10px);padding:8px;border:1px solid rgba(11,24,43,0.1);border-radius:18px;box-shadow:0 10px 28px rgba(11,24,43,0.18);gap:8px;}',
      '.raluma-mobile-actions.is-context-hidden{opacity:0;visibility:hidden;pointer-events:none;transform:translateY(14px);}',
      '.raluma-mobile-actions__btn{flex:1;display:flex;align-items:center;justify-content:center;min-height:52px;padding:0 12px;border-radius:12px;text-decoration:none;font-size:14px;line-height:1.2;font-weight:600;border:1px solid transparent;}',
      '.raluma-mobile-actions__btn--call{color:#111;background:#fff;border-color:rgba(17,17,17,0.18);}',
      '.raluma-mobile-actions__btn--calc{color:#fff;background:#ff0000;max-width:280px;opacity:1;transform:translateX(0);transition:max-width .22s ease,opacity .18s ease,transform .22s ease,padding .22s ease,margin .22s ease,border-width .22s ease;}',
      '.raluma-mobile-actions.is-form-zone .raluma-mobile-actions__btn--calc{max-width:0;opacity:0;transform:translateX(10px);padding-left:0;padding-right:0;margin:0;border-width:0;overflow:hidden;pointer-events:none;}',
      '.raluma-mobile-actions.is-form-zone .raluma-mobile-actions__btn--call{flex:1 1 100%;}',
      '.raluma-mobile-actions__btn:focus-visible{outline:2px solid #111;outline-offset:1px;}',
      '.raluma-mobile-actions__btn:active{transform:translateY(1px);}',
      'section#lead-form{scroll-margin-top:var(--raluma-anchor-offset-desktop);}',
      '#cases-prices{scroll-margin-top:var(--raluma-anchor-offset-desktop);}',
      '#rec2145215921 .t890{left:20px;right:auto;bottom:var(--raluma-scroll-up-offset);z-index:1010;}',
      '@media screen and (min-width:981px){:root{--raluma-bottom-layer-height:0px;--raluma-floating-gap:20px;--raluma-floating-stack-gap:12px;}body{padding-top:0;} }',
      '@media screen and (max-width:1200px){:root{--raluma-floating-gap:18px;--raluma-floating-stack-gap:12px;}}',
      '@media screen and (max-width:980px){:root{--raluma-bottom-layer-height:var(--bottom-bar-height,76px);--raluma-floating-gap:16px;--raluma-floating-stack-gap:14px;--raluma-mobile-actions-bottom-offset:12px;} .raluma-callbar{display:none!important;}.raluma-mobile-actions{display:flex;transition:opacity .24s ease,visibility .24s ease,transform .24s ease;}body{padding-bottom:calc(var(--raluma-mobile-bar-height) + var(--raluma-safe-area-bottom) + 22px);}section#lead-form{scroll-margin-top:var(--raluma-anchor-offset-mobile);}#cases-prices{scroll-margin-top:var(--raluma-anchor-offset-mobile);} }',
      '@media screen and (max-width:1200px){.raluma-callbar{top:14px;right:14px;min-width:290px;}}',
      '@media screen and (max-width:640px){#rec2143512671 .t182__buttons{margin-top:28px;}}',
      '#rec2143512671 .t182__descr-line{display:block;}',
      '#rec2143512671 .t182__descr-line--second{margin-top:2px;}',
      '#rec2143512671 .t-btnflex.t-btnflex_type_button2{color:#0f1726;background:linear-gradient(180deg,#ffffff 0%,#f5f7fb 100%);border:1px solid rgba(14,25,43,0.12)!important;box-shadow:0 12px 28px rgba(10,18,34,0.22),inset 0 1px 0 rgba(255,255,255,0.88)!important;transition:background-color .2s ease,color .2s ease,border-color .2s ease,box-shadow .22s ease,transform .22s ease;}',
      '#rec2143512671 .t-btnflex.t-btnflex_type_button2:active{transform:translateY(1px) scale(.995);box-shadow:0 8px 16px rgba(10,18,34,0.2),inset 0 1px 0 rgba(255,255,255,0.85)!important;}',
      '.raluma-cookie-widget{position:fixed;left:20px;bottom:var(--raluma-cookies-trigger-offset);z-index:1020;display:flex;flex-direction:column;align-items:flex-start;gap:10px;opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .2s ease,transform .2s ease;}',
      '.raluma-cookie-widget.is-visible{opacity:1;transform:translateY(0);pointer-events:auto;}',
      '.raluma-cookie-widget__trigger{width:48px;height:48px;border:none;border-radius:999px;background:#fff;box-shadow:0 8px 24px rgba(11,24,43,0.18);font-size:24px;cursor:pointer;}',
      '.raluma-cookie-widget__popover{display:none;max-width:240px;padding:12px;border-radius:14px;background:#fff;border:1px solid rgba(11,24,43,0.12);box-shadow:0 10px 26px rgba(11,24,43,0.16);position:relative;z-index:1;}',
      '.raluma-cookie-widget.is-open .raluma-cookie-widget__popover{display:block;}',
      '.raluma-cookie-widget__text{margin:0 0 10px;font-size:13px;line-height:1.4;color:#1d2736;}',
      '.raluma-cookie-widget__actions{display:flex;gap:8px;align-items:center;}',
      '.raluma-cookie-widget__accept{border:none;border-radius:999px;background:#111;color:#fff;font-size:12px;font-weight:600;padding:8px 12px;cursor:pointer;}',
      '.raluma-cookie-widget__more{font-size:12px;font-weight:600;color:#111;text-decoration:underline;}',
      '@media (hover:hover){#rec2143512671 .t-btnflex.t-btnflex_type_button2:not(.t-animate_no-hover):hover,#rec2143512671 .t-btnflex.t-btnflex_type_button2:not(.t-animate_no-hover):focus-visible{color:#141f31!important;border-color:rgba(14,25,43,0.24)!important;background:linear-gradient(180deg,#ffffff 0%,#eef2f8 100%)!important;box-shadow:0 16px 34px rgba(10,18,34,0.26),inset 0 1px 0 rgba(255,255,255,0.95)!important;}}',
      '#rec2145460381 .t463__maincontainer{padding-top:22px;padding-bottom:18px;}',
      '#rec2145460381 .t463__content{display:flex;flex-direction:column;gap:14px;}',
      '#rec2145460381 .t463__colwrapper{display:grid;grid-template-columns:minmax(120px,auto) minmax(260px,1fr) minmax(220px,auto);align-items:center;gap:16px;}',
      '#rec2145460381 .t463__col,#rec2145460381 .t463__col_center,#rec2145460381 .t463__col.t-align_right{text-align:center!important;}',
      '#rec2145460381 .raluma-footer__cityline{color:#fff;font-size:15px;line-height:1.45;font-weight:500;text-align:center;max-width:640px;margin:0 auto;overflow-wrap:anywhere;}',
      '#rec2145460381 .raluma-footer__cityline-break{display:inline;}',
      '#rec2145460381 .raluma-footer__copyright-row{display:flex;justify-content:center;}',
      '#rec2145460381 .raluma-footer__copyright-row .t463__copyright{margin:0;text-align:center;}',
      '#rec2145460381 .t-sociallinks__wrapper{justify-content:center;}',
      '@media screen and (max-width:980px){#rec2145460381 .t463__maincontainer{padding-top:18px;padding-bottom:16px;}#rec2145460381 .t463__colwrapper{display:flex;flex-direction:column;align-items:center;gap:10px;}#rec2145460381 .t463__col{width:100%;text-align:center!important;}#rec2145460381 .raluma-footer__cityline{order:1;text-align:center;font-size:14px;line-height:1.45;max-width:360px;}#rec2145460381 .t463__col:first-child{order:2;}#rec2145460381 .t463__logo{max-width:76px!important;height:auto;}#rec2145460381 .raluma-footer__copyright-row{order:3;}#rec2145460381 .t463__col:last-child{order:4;}#rec2145460381 .t-sociallinks__wrapper{justify-content:center;}}',
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
      var isMobileLayout = window.matchMedia('(max-width: 980px)').matches;
      var height = isMobileLayout && actionBar ? actionBar.offsetHeight || 76 : 0;
      document.documentElement.style.setProperty('--raluma-mobile-bar-height', height + 'px');
      document.documentElement.style.setProperty('--bottom-bar-height', height + 'px');
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update);
    }
  }

  function setupContextMobileBar(actionBar) {
    if (!actionBar) return;

    var leadSection = document.getElementById('lead-form');
    var consultSection = document.getElementById('rec2144142381');
    if (typeof window.IntersectionObserver !== 'function') return;

    if (leadSection) {
      var formObserver = new IntersectionObserver(
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

      formObserver.observe(leadSection);
    }

    if (!consultSection) return;

    var consultObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var hideBar = entry.isIntersecting && entry.intersectionRatio > 0.18;
          actionBar.classList.toggle('is-context-hidden', hideBar);
        });
      },
      {
        root: null,
        threshold: [0, 0.18, 0.35, 0.6],
        rootMargin: '-8% 0px -18% 0px'
      }
    );

    consultObserver.observe(consultSection);
  }

  function stabilizeHeroSubtitle() {
    var subtitle = document.querySelector('#rec2143512671 .t182__descr');
    if (!subtitle) return;

    subtitle.innerHTML =
      '<span class="t182__descr-line">Свет, тишина и открытое пространство</span>' +
      '<span class="t182__descr-line t182__descr-line--second">с панорамным видом</span>';
  }

  function enhanceFooterLayout() {
    var footer = document.getElementById('rec2145460381');
    if (!footer) return;

    var content = footer.querySelector('.t463__content');
    var colWrapper = footer.querySelector('.t463__colwrapper');
    var copyright = footer.querySelector('.t463__copyright');
    if (!content || !colWrapper || !copyright) return;

    var centerCol = footer.querySelector('.t463__col_center');
    if (!centerCol) return;

    var cityline = footer.querySelector('.raluma-footer__cityline');
    if (!cityline) {
      cityline = document.createElement('div');
      cityline.className = 'raluma-footer__cityline';
      cityline.textContent = 'Raluma безрамное остекление террас, веранд и беседок в Санкт-Петербурге и ЛО';
      centerCol.appendChild(cityline);
    }

    var copyrightRow = footer.querySelector('.raluma-footer__copyright-row');
    if (!copyrightRow) {
      copyrightRow = document.createElement('div');
      copyrightRow.className = 'raluma-footer__copyright-row';
      content.appendChild(copyrightRow);
    }
    copyrightRow.appendChild(copyright);
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

  function setupCompactCookieConsent() {
    var storageKey = 'cookiesAccepted';
    try {
      if (window.localStorage.getItem(storageKey) === 'true') return;
    } catch (error) {
      return;
    }

    var triggerOffset = 50;
    var shown = false;
    var widget = document.createElement('div');
    widget.className = 'raluma-cookie-widget';
    widget.innerHTML =
      '<button type="button" class="raluma-cookie-widget__trigger" aria-label="Настройки cookies">🍪</button>' +
      '<div class="raluma-cookie-widget__popover" role="dialog" aria-label="Использование cookies" aria-hidden="true">' +
      '  <p class="raluma-cookie-widget__text">Используем cookies для корректной работы и улучшения сервиса.</p>' +
      '  <div class="raluma-cookie-widget__actions">' +
      '    <button type="button" class="raluma-cookie-widget__accept">Принять</button>' +
      '    <a href="#popup:privacy" class="raluma-cookie-widget__more">Подробнее</a>' +
      '  </div>' +
      '</div>';

    var trigger = widget.querySelector('.raluma-cookie-widget__trigger');
    var popover = widget.querySelector('.raluma-cookie-widget__popover');
    var acceptButton = widget.querySelector('.raluma-cookie-widget__accept');

    function openPopover() {
      widget.classList.add('is-open');
      popover.setAttribute('aria-hidden', 'false');
    }

    function closePopover() {
      widget.classList.remove('is-open');
      popover.setAttribute('aria-hidden', 'true');
    }

    function revealWidget() {
      if (shown) return;
      shown = true;
      widget.classList.add('is-visible');
      window.removeEventListener('scroll', onScroll, { passive: true });
    }

    function onScroll() {
      if ((window.scrollY || 0) >= triggerOffset) revealWidget();
    }

    trigger.addEventListener('click', function () {
      if (widget.classList.contains('is-open')) {
        closePopover();
      } else {
        openPopover();
      }
    });

    acceptButton.addEventListener('click', function () {
      try {
        window.localStorage.setItem(storageKey, 'true');
      } catch (error) {}
      closePopover();
      widget.remove();
    });

    document.addEventListener('click', function (event) {
      if (!widget.classList.contains('is-open')) return;
      if (widget.contains(event.target)) return;
      closePopover();
    });

    document.body.appendChild(widget);

    if ((window.scrollY || 0) >= triggerOffset) {
      revealWidget();
      return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  onReady(function () {
    document.querySelectorAll('form.lead-form').forEach(attachLeadFormHandler);

    injectCallUxStyles();
    stabilizeHeroSubtitle();
    enhanceFooterLayout();
    insertDesktopStickyCallbar();
    setupCallbarStateListener();
    var mobileBar = insertMobileActionBar();
    syncMobileOffsets(mobileBar);
    setupContextMobileBar(mobileBar);
    setupAnchorTargets();
    setupCompactCookieConsent();

    if (typeof window.t_prod__init !== 'function') {
      window.t_prod__init = function () {};
    }
  });
})();
