(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }
    fn();
  }

  function normalizeRuPhone(raw) {
    var digits = String(raw || '').replace(/\D/g, '');
    if (digits.length === 10) digits = '7' + digits;
    if (digits.length === 11 && digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    return digits.length === 11 && digits.charAt(0) === '7' ? '+7' + digits.slice(1) : '';
  }

  function setStatus(box, text, isError) {
    if (!box) {
      window.alert(text);
      return;
    }

    box.textContent = text;
    box.style.display = 'block';
    box.style.color = isError ? '#b00020' : '#0a7a1c';
    box.style.textAlign = 'center';
    box.style.fontFamily = 'Montserrat, Arial, sans-serif';
  }

  function setButtonBusy(button, isBusy, busyText) {
    if (!button) return;

    var textNode = button.tagName === 'BUTTON' ? button.querySelector('.t-btnflex__text') : null;
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = textNode ? textNode.textContent : button.value;
    }

    if (isBusy) {
      button.disabled = true;
      if (textNode) textNode.textContent = busyText;
      else button.value = busyText;
      return;
    }

    button.disabled = false;
    if (textNode) textNode.textContent = button.dataset.originalLabel;
    else button.value = button.dataset.originalLabel;
  }

  function validateLeadForm(form) {
    var nameInput = form.querySelector('input[name="name"]');
    var hiddenPhoneInput = form.querySelector('input[name="phone"]');
    var visiblePhoneInput = form.querySelector('input[type="tel"][name="tildaspec-phone-part[]"], input[type="tel"].t-input-phonemask');

    var name = (nameInput && nameInput.value || '').trim();
    var normalizedPhone = normalizeRuPhone(
      (visiblePhoneInput && visiblePhoneInput.value) || (hiddenPhoneInput && hiddenPhoneInput.value) || ''
    );

    return {
      name: name,
      phone: normalizedPhone,
      hiddenPhoneInput: hiddenPhoneInput,
      isValidName: name.length >= 2,
      isValidPhone: Boolean(normalizedPhone)
    };
  }

  function attachLeadFormHandler(form) {
    if (form.dataset.hardened === '1') return;
    form.dataset.hardened = '1';

    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      var successBox = form.querySelector('.js-successbox');
      var button = form.querySelector('button[type="submit"], input[type="submit"]');
      var validation = validateLeadForm(form);

      if (successBox) successBox.style.display = 'none';

      if (!validation.isValidName) {
        setStatus(successBox, 'Введите имя (минимум 2 символа).', true);
        return;
      }

      if (!validation.isValidPhone) {
        setStatus(successBox, 'Введите корректный номер телефона РФ.', true);
        return;
      }

      if (validation.hiddenPhoneInput) {
        validation.hiddenPhoneInput.value = validation.phone;
      }

      setButtonBusy(button, true, 'Идет расчет...');
      if (button) button.style.opacity = '0.7';

      var params = new URLSearchParams(window.location.search);
      var data = new FormData(form);

      data.set('name', validation.name);
      data.set('phone', validation.phone);
      data.set('form_name', data.get('form_name') || form.dataset.formName || 'Рассчитать стоимость');
      data.set('_subject', data.get('_subject') || 'Новая заявка с сайта Raluma');
      data.set('_gotcha', data.get('_gotcha') || '');
      data.set('page_url', window.location.href);
      data.set('page_title', document.title);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
        data.set(key, params.get(key) || '');
      });

      try {
        var response = await fetch(form.getAttribute('action') || 'https://formspree.io/f/mjgpywnr', {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('request_failed');

        var inputsBox = form.querySelector('.t-form__inputsbox');
        var hint = form.closest('.t722__mainwrapper') && form.closest('.t722__mainwrapper').querySelector('.t722__hint');

        if (inputsBox) {
          inputsBox.style.transition = 'opacity 0.25s ease';
          inputsBox.style.opacity = '0';
          window.setTimeout(function () {
            inputsBox.style.display = 'none';
          }, 250);
        }

        if (hint) hint.style.display = 'none';

        setStatus(successBox, 'Спасибо! Заявка успешно отправлена. Мы свяжемся с вами в течение 15 минут для уточнения деталей', false);
        successBox.style.fontSize = '20px';
        successBox.style.fontWeight = '600';

        form.reset();
        if (validation.hiddenPhoneInput) validation.hiddenPhoneInput.value = '';

        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (error) {
        setStatus(successBox, 'Не удалось отправить заявку. Проверьте интернет и попробуйте ещё раз.', true);
      } finally {
        setButtonBusy(button, false);
        if (button) button.style.opacity = '';
      }
    });
  }

  onReady(function () {
    document.querySelectorAll('form.lead-form').forEach(attachLeadFormHandler);

    // remove occasional broken inline width from Tilda cookie widget
    var cookieWrapper = document.querySelector('#rec2145452701 .t886__wrapper');
    if (cookieWrapper) cookieWrapper.style.maxWidth = 'calc(100vw - 32px)';

    // normalize accidental whitespace in utility class from exported markup
    var toTopButton = document.querySelector('#rec2145215921 .t890__arrow');
    if (toTopButton && /\s/.test(toTopButton.className)) {
      toTopButton.className = toTopButton.className.trim().replace(/\s+/g, ' ');
    }
  });
})();
