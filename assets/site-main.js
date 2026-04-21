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
      ':root{--raluma-callbar-height:74px;--raluma-mobile-bar-height:76px;}',
      '.raluma-callbar{position:fixed;top:0;left:0;right:0;z-index:990;background:#182230;border-bottom:1px solid rgba(255,255,255,0.18);box-shadow:none;transition:background-color .24s ease,border-color .24s ease,box-shadow .24s ease,color .24s ease;}',
      '.raluma-callbar__inner{max-width:1240px;margin:0 auto;display:flex;align-items:center;justify-content:flex-end;gap:22px;padding:12px 24px;min-height:var(--raluma-callbar-height);}',
      '.raluma-callbar__phone-wrap{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}',
      '.raluma-callbar__phone{font-size:24px;line-height:1.2;font-weight:600;color:#fff;text-decoration:none;letter-spacing:0.01em;transition:color .2s ease;}',
      '.raluma-callbar__hours{font-size:12px;line-height:1.3;color:rgba(255,255,255,0.78);transition:color .2s ease;}',
      '.raluma-callbar__cta{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 26px;border-radius:999px;border:1px solid rgba(255,255,255,0.6);background:transparent;color:#fff;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;text-decoration:none;transition:all .2s ease;}',
      '.raluma-callbar__phone:hover,.raluma-callbar__phone:focus-visible{color:#fced00;outline:none;}',
      '.raluma-callbar__cta:hover,.raluma-callbar__cta:focus-visible{background:#fff;color:#111;border-color:#fff;outline:none;}',
      '.raluma-callbar__cta:active{transform:translateY(1px);}',
      '.raluma-callbar.is-scrolled{background:#ffffff;border-bottom:1px solid rgba(11,24,43,0.12);box-shadow:0 10px 24px rgba(11,24,43,0.09);}',
      '.raluma-callbar.is-scrolled .raluma-callbar__phone{color:#111;}',
      '.raluma-callbar.is-scrolled .raluma-callbar__hours{color:rgba(17,17,17,0.62);}',
      '.raluma-callbar.is-scrolled .raluma-callbar__phone:hover,.raluma-callbar.is-scrolled .raluma-callbar__phone:focus-visible{color:#d40000;}',
      '.raluma-callbar.is-scrolled .raluma-callbar__cta{background:#111;color:#fff;border-color:#111;}',
      '.raluma-callbar.is-scrolled .raluma-callbar__cta:hover,.raluma-callbar.is-scrolled .raluma-callbar__cta:focus-visible{background:#2d3949;border-color:#2d3949;color:#fff;}',
      '.raluma-mobile-actions{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:992;display:none;background:rgba(255,255,255,0.96);backdrop-filter:blur(10px);padding:8px;border:1px solid rgba(11,24,43,0.1);border-radius:18px;box-shadow:0 10px 28px rgba(11,24,43,0.18);gap:8px;}',
      '.raluma-mobile-actions__btn{flex:1;display:flex;align-items:center;justify-content:center;min-height:52px;padding:0 12px;border-radius:12px;text-decoration:none;font-size:14px;line-height:1.2;font-weight:600;border:1px solid transparent;}',
      '.raluma-mobile-actions__btn--call{color:#111;background:#fff;border-color:rgba(17,17,17,0.18);}',
      '.raluma-mobile-actions__btn--calc{color:#fff;background:#ff0000;}',
      '.raluma-mobile-actions__btn:focus-visible{outline:2px solid #111;outline-offset:1px;}',
      '.raluma-mobile-actions__btn:active{transform:translateY(1px);}',
      '.raluma-form-phone-note{margin-top:14px;font-size:16px;line-height:1.4;color:#111;text-align:center;}',
      '.raluma-form-phone-note a{color:#111;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(17,17,17,0.3);}',
      '.raluma-form-phone-note a:hover,.raluma-form-phone-note a:focus-visible{color:#d40000;border-bottom-color:#d40000;outline:none;}',
      '@media screen and (min-width:981px){body{padding-top:var(--raluma-callbar-height);}#rec2145215921 .t890{bottom:20px;} }',
      '@media screen and (max-width:980px){.raluma-callbar{display:none!important;}.raluma-mobile-actions{display:flex;}body{padding-bottom:calc(var(--raluma-mobile-bar-height) + env(safe-area-inset-bottom) + 22px);}#rec2145215921 .t890{bottom:calc(var(--raluma-mobile-bar-height) + env(safe-area-inset-bottom) + 24px);} }',
      '@media screen and (max-width:640px){.raluma-form-phone-note{font-size:14px;margin-top:12px;}}'
    ].join('');

    document.head.appendChild(style);
  }

  function insertDesktopStickyCallbar() {
    if (document.querySelector('.raluma-callbar')) return;

    var bar = document.createElement('div');
    bar.className = 'raluma-callbar';
    bar.innerHTML =
      '<div class="raluma-callbar__inner">' +
      '  <div class="raluma-callbar__phone-wrap">' +
      '    <a class="raluma-callbar__phone" href="' + PHONE_HREF + '" aria-label="Позвонить по номеру +7 (812) 330-74-15">' + PHONE_DISPLAY + '</a>' +
      '    <span class="raluma-callbar__hours">Ежедневно 9:00–21:00</span>' +
      '  </div>' +
      '  <a class="raluma-callbar__cta" href="' + PHONE_HREF + '" aria-label="Позвонить по номеру +7 (812) 330-74-15">Позвонить</a>' +
      '</div>';

    document.body.appendChild(bar);
  }

  function setupCallbarStateListener() {
    var callbar = document.querySelector('.raluma-callbar');
    if (!callbar) return;

    var threshold = 56;

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
  }

  function insertFormPhoneNote() {
    if (document.querySelector('.raluma-form-phone-note')) return;

    var descr = document.querySelector('#rec2144564801 .t722__descr');
    if (!descr || !descr.parentElement) return;

    var note = document.createElement('p');
    note.className = 'raluma-form-phone-note';
    note.innerHTML = 'Или позвоните сразу: <a href="' + PHONE_HREF + '" aria-label="Позвонить по номеру +7 (812) 330-74-15">' + PHONE_DISPLAY + '</a>';

    descr.insertAdjacentElement('afterend', note);
  }

  onReady(function () {
    document.querySelectorAll('form.lead-form').forEach(attachLeadFormHandler);

    var cookieWrapper = document.querySelector('#rec2145452701 .t886__wrapper');
    if (cookieWrapper) cookieWrapper.style.maxWidth = 'calc(100vw - 32px)';

    injectCallUxStyles();
    insertDesktopStickyCallbar();
    setupCallbarStateListener();
    insertMobileActionBar();
    insertFormPhoneNote();

    if (typeof window.t_prod__init !== 'function') {
      window.t_prod__init = function () {};
    }
  });
})();
