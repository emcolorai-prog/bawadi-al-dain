// Behaviour shared by the company websites: mobile navigation, active section,
// scroll reveal, product image swap and the enquiry form. Loaded after i18n.js.
(function () {
  var html = document.documentElement;
  var t = function (k, v) { return window.siteLang ? window.siteLang.t(k, v) : k; };
  var lang = function () { return window.siteLang ? window.siteLang.get() : 'en'; };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Preview mode ----------
  // Anywhere other than the live domain (a review link, or files opened on a computer)
  // the site runs as a preview: search engines are asked not to index it, and enquiry
  // forms are checked but not sent. On the live domain this is off.
  var LIVE_HOSTS = ['bawadialdaingroup.com', 'www.bawadialdaingroup.com'];
  var isPreview = function () { return !window.SITE_FORCE_LIVE && LIVE_HOSTS.indexOf(location.hostname) === -1; };
  if (isPreview()) {
    var robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
  }

  // ---------- Header: mobile menu ----------
  document.querySelectorAll('[data-nav]').forEach(function (header) {
    var btn = header.querySelector('[data-nav-toggle]');
    var nav = header.querySelector('nav');
    if (!btn || !nav) { return; }
    var label = btn.querySelector('.sr-only');
    function setOpen(open, returnFocus) {
      header.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (label) { label.textContent = t(open ? 'ui.menuClose' : 'ui.menu'); }
      if (!open && returnFocus) { btn.focus(); }
    }
    btn.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { setOpen(false, true); }
    });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) { setOpen(false); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && header.classList.contains('nav-open')) { setOpen(false); }
    });
    document.addEventListener('langchange', function () {
      if (label) { label.textContent = t(header.classList.contains('nav-open') ? 'ui.menuClose' : 'ui.menu'); }
    });
    // Subtle shadow once the page scrolls
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });

  // ---------- Active section in the navigation ----------
  var navLinks = [].slice.call(document.querySelectorAll('nav a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = id && document.getElementById(id);
      if (sec) { (byId[id] = byId[id] || []).push(a); }
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        (byId[en.target.id] || []).forEach(function (a) { a.setAttribute('aria-current', 'location'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  // ---------- Photos with a stand-in ----------
  // <img src="new.jpg" data-fallback="existing.jpg" data-fallback-alt="key">: if the first file
  // has not been added to the site yet, the existing photo is shown instead.
  // data-fallback="hide" removes the photo's [data-fallback-box] instead; a [data-fallback-section]
  // left with no photos is hidden.
  function tidyFallbacks() {
    document.querySelectorAll('[data-fallback-section]').forEach(function (s) {
      if (!s.querySelector('img')) { s.hidden = true; }
    });
  }
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function swap() {
      var fb = img.getAttribute('data-fallback');
      if (!fb) { return; }
      img.removeAttribute('data-fallback');
      if (fb === 'hide') {
        (img.closest('[data-fallback-box]') || img).remove();
        tidyFallbacks();
        return;
      }
      var k = img.getAttribute('data-fallback-alt');
      if (k) { img.setAttribute('data-i18n-alt', k); img.alt = t(k); }
      img.src = fb;
    }
    if (img.complete && img.naturalWidth === 0) { swap(); } else { img.addEventListener('error', swap); }
  });

  // ---------- Photos that do not match the shape of their frame ----------
  // A tall photo in a wide gallery tile (or a wide one in a tall frame) would lose most of the picture
  // to cropping. Such photos get class "is-whole": the whole photo is shown, over a blurred copy of
  // itself that fills the rest of the frame (styles in corporate.css). Photos close to the frame's
  // shape still fill it. Re-checked whenever a frame changes size, e.g. when the gallery grid opens.
  var fitFrames = [].slice.call(document.querySelectorAll('.media-open, .bw-prod-img'));
  var fitFrame = function (f) {
    var img = f.querySelector('img');
    var w = img ? +img.getAttribute('width') : 0, h = img ? +img.getAttribute('height') : 0;
    var fw = f.clientWidth, fh = f.clientHeight;
    if (!w || !h || !fw || !fh) { return; }   // not laid out yet (e.g. the grid hidden behind the wheel)
    var k = (w / h) / (fw / fh);
    var whole = k < 0.75 || k > 1.4;   // close enough shapes (e.g. 16:9 in a 4:3 tile) still fill the frame
    f.classList.toggle('is-whole', whole);
    if (whole && !f.style.getPropertyValue('--img')) { f.style.setProperty('--img', 'url("' + img.src + '")'); }
  };
  if (fitFrames.length) {
    if ('ResizeObserver' in window) {
      var fitRO = new ResizeObserver(function (entries) { entries.forEach(function (en) { fitFrame(en.target); }); });
      fitFrames.forEach(function (f) { fitRO.observe(f); });
    } else {
      fitFrames.forEach(fitFrame);
      window.addEventListener('resize', function () { fitFrames.forEach(fitFrame); });
    }
  }

  // ---------- Reveal on scroll ----------
  if ('IntersectionObserver' in window && !reduceMotion) {
    html.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  // ---------- Product index: choosing a product swaps the large image ----------
  var swapTarget = document.querySelector('[data-swap-target]');
  var swapButtons = [].slice.call(document.querySelectorAll('[data-swap]'));
  if (swapTarget && swapButtons.length) {
    var currentBtn = swapButtons[0];
    var show = function (btn) {
      if (btn === currentBtn) { return; }
      currentBtn = btn;
      swapButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var go = function () {
        swapTarget.src = btn.getAttribute('data-swap');
        swapTarget.alt = t(btn.getAttribute('data-swap-alt'));
        swapTarget.classList.remove('is-fading');
      };
      if (reduceMotion) { go(); } else { swapTarget.classList.add('is-fading'); setTimeout(go, 180); }
    };
    swapButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { show(btn); });
      btn.addEventListener('focus', function () { show(btn); });
      btn.addEventListener('mouseenter', function () { show(btn); });
    });
    document.addEventListener('langchange', function () { swapTarget.alt = t(currentBtn.getAttribute('data-swap-alt')); });
  }

  // ---------- Enquiry form ----------
  // Enquiries are delivered to the company's inbox through FormSubmit (form data-endpoint).
  // If the service cannot be reached, the visitor is offered a ready-made email instead,
  // so no enquiry is lost. Without data-endpoint the form falls back to the email app.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  document.querySelectorAll('form[data-enquiry-form]').forEach(function (form) {
    var to = form.getAttribute('data-mailto');
    var endpoint = form.getAttribute('data-endpoint');
    var status = form.querySelector('.enq-status');
    var sendBtn = form.querySelector('.enq-send');
    var honey = form.querySelector('[name="_honey"]');
    var fields = [].slice.call(form.querySelectorAll('input,textarea')).filter(function (f) { return f !== honey; });
    var sending = false;
    var current = null;   // { key, vars(), kind } so the message can be re-translated

    // The company's official name is used as-is in every language
    function companyName() { return form.getAttribute('data-company') || ''; }
    function renderStatus() {
      if (!current) { status.innerHTML = ''; status.removeAttribute('data-kind'); return; }
      status.innerHTML = t(current.key, current.vars ? current.vars() : null);
      status.setAttribute('data-kind', current.kind);
    }
    function setStatus(key, vars, kind) { current = key ? { key: key, vars: vars, kind: kind } : null; renderStatus(); }

    function fieldError(f) {
      var v = f.value.trim();
      if (f.required && !v) { return 'ui.err.required'; }
      if (f.type === 'email' && v && !EMAIL_RE.test(v)) { return 'ui.err.email'; }
      if (f.name === 'message' && v && v.length < 10) { return 'ui.err.short'; }
      return '';
    }
    function showError(f, key) {
      f.setAttribute('aria-invalid', key ? 'true' : 'false');
      var err = document.getElementById((f.getAttribute('aria-describedby') || '').split(' ')[0]);
      if (!err) { return; }
      err.setAttribute('data-err', key);
      err.textContent = key ? t(key) : '';
    }
    fields.forEach(function (f) {
      // Re-check a field once the visitor has corrected it
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') { showError(f, fieldError(f)); } });
      f.addEventListener('blur', function () { if (f.value.trim()) { showError(f, fieldError(f)); } });
    });

    var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ''; };
    function mailtoHref() {
      var lines = [
        get('subject') ? t('ui.subjectLbl') + ': ' + get('subject') : '',
        t('ui.name') + ': ' + get('name'),
        get('company') ? t('ui.company') + ': ' + get('company') : '',
        t('ui.email') + ': ' + get('email'),
        get('phone') ? t('ui.phone') + ': ' + get('phone') : '',
        '',
        get('message')
      ].filter(function (l, i) { return l !== '' || i === 5; });
      return 'mailto:' + to + '?subject=' + encodeURIComponent(t('ui.subject', { name: get('name') })) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }
    function setSending(on) {
      sending = on;
      sendBtn.disabled = on;
      sendBtn.textContent = t(on ? 'ui.sending' : 'ui.send');
      if (on) { form.setAttribute('aria-busy', 'true'); } else { form.removeAttribute('aria-busy'); }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) { return; }
      var first = null;
      fields.forEach(function (f) {
        var key = fieldError(f);
        showError(f, key);
        if (key && !first) { first = f; }
      });
      if (first) { setStatus('ui.err.summary', null, 'error'); first.focus(); return; }

      var name = get('name'), email = get('email');
      var sentVars = function () { return { name: esc(name), company: esc(companyName()), email: '<span class="ltr">' + esc(email) + '</span>' }; };

      // Spam bots fill the hidden field: show the normal confirmation but send nothing
      if (honey && honey.value) { setStatus('ui.sent', sentVars, 'success'); form.reset(); return; }

      // Preview copy: everything is checked, but nothing is sent
      if (isPreview()) {
        setStatus('ui.preview', function () { return { email: '<span class="ltr">' + to + '</span>' }; }, 'info');
        return;
      }

      // No delivery service configured: hand over to the visitor's email app
      if (!endpoint) {
        setStatus('ui.ok', function () { return { email: '<span class="ltr">' + to + '</span>', link: '<a class="ltr" href="mailto:' + to + '">' + to + '</a>' }; }, 'info');
        window.location.href = mailtoHref();
        return;
      }

      var fallback = mailtoHref();
      var subject = get('subject');
      var payload = {
        subject: subject,
        name: name,
        company: get('company'),
        email: email,
        phone: get('phone'),
        message: get('message'),
        language: { en: 'English', ar: 'Arabic', fr: 'French' }[lang()] || lang(),
        page: location.href.split('?')[0],
        _subject: (subject ? subject + ' — ' : '') + t('ui.subject', { name: name }) + ' — ' + companyName(),
        _template: 'table',
        _captcha: 'false'
      };
      setStatus('', null, '');
      setSending(true);
      // Give up after 20 seconds so the visitor is never left waiting
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : null;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        clearTimeout(timer);
        return res.json().catch(function () { return {}; }).then(function (j) {
          if (!res.ok || String(j.success) !== 'true') { throw new Error(j.message || ('HTTP ' + res.status)); }
        });
      }).then(function () {
        setSending(false);
        setStatus('ui.sent', sentVars, 'success');
        form.reset();
        fields.forEach(function (f) { f.setAttribute('aria-invalid', 'false'); });
        status.setAttribute('tabindex', '-1');
        status.focus();   // move focus to the confirmation for keyboard and screen-reader users
      }).catch(function () {
        clearTimeout(timer);
        setSending(false);
        setStatus('ui.fail', function () { return { link: '<a class="ltr" href="' + fallback + '">' + to + '</a>' }; }, 'error');
      });
    });

    // Keep any visible messages in the current language
    document.addEventListener('langchange', function () {
      form.querySelectorAll('.enq-error[data-err]').forEach(function (err) {
        var key = err.getAttribute('data-err');
        err.textContent = key ? t(key) : '';
      });
      if (sending) { sendBtn.textContent = t('ui.sending'); }
      renderStatus();
    });
  });
  /* ---------- Photo and video gallery ---------- */
  var galleries = [].slice.call(document.querySelectorAll('[data-gallery]'));
  if (galleries.length) {
    var lb = document.createElement('dialog');
    lb.className = 'lightbox';
    lb.innerHTML = '<p class="lb-count ltr" aria-hidden="true"></p>' +
      '<div class="lb-stage"></div><p class="lb-cap" aria-live="polite"></p>' +
      '<button type="button" class="lb-btn lb-prev"><span aria-hidden="true">&#8249;</span></button>' +
      '<button type="button" class="lb-btn lb-next"><span aria-hidden="true">&#8250;</span></button>' +
      '<button type="button" class="lb-btn lb-close"><span aria-hidden="true">&times;</span></button>';
    document.body.appendChild(lb);
    var stage = lb.querySelector('.lb-stage'), cap = lb.querySelector('.lb-cap'), count = lb.querySelector('.lb-count');
    var prevBtn = lb.querySelector('.lb-prev'), nextBtn = lb.querySelector('.lb-next'), closeBtn = lb.querySelector('.lb-close');
    var list = [], index = 0, opener = null;
    var isRtl = function () { return document.documentElement.getAttribute('dir') === 'rtl'; };
    var labelLightbox = function () {
      prevBtn.setAttribute('aria-label', t('ui.galPrev'));
      nextBtn.setAttribute('aria-label', t('ui.galNext'));
      closeBtn.setAttribute('aria-label', t('ui.galClose'));
    };
    var capOf = function (li) { var c = li.querySelector('.media-cap'); return c ? c.textContent : ''; };

    function render() {
      var li = list[index], btn = li.querySelector('.media-open');
      stage.innerHTML = '';
      var el;
      if (btn.hasAttribute('data-video')) {
        el = document.createElement('video');
        el.controls = true; el.autoplay = true; el.playsInline = true; el.preload = 'metadata';
        el.poster = btn.getAttribute('data-poster');
        el.src = btn.getAttribute('data-video');
      } else {
        el = document.createElement('img');
        el.src = btn.getAttribute('data-full');
      }
      el.alt = capOf(li);
      el.setAttribute('aria-label', capOf(li));
      stage.appendChild(el);
      cap.textContent = capOf(li);
      count.textContent = (index + 1) + ' / ' + list.length;
      var many = list.length > 1;
      prevBtn.hidden = !many; nextBtn.hidden = !many;
    }
    function step(d) { if (list.length > 1) { index = (index + d + list.length) % list.length; render(); } }
    function stopMedia() { var v = stage.querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); } stage.innerHTML = ''; }

    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    closeBtn.addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) { lb.close(); } });
    lb.addEventListener('close', function () { stopMedia(); document.documentElement.style.overflow = ''; if (opener) { opener.focus(); } });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(isRtl() ? -1 : 1); }
      if (e.key === 'ArrowLeft') { step(isRtl() ? 1 : -1); }
    });
    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) { return; }
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50 && !(e.target.tagName === 'VIDEO')) { step((dx < 0) !== isRtl() ? 1 : -1); }
    });

    var twoUp = window.matchMedia('(max-width:640px)'), wide = window.matchMedia('(min-width:961px)');
    galleries.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var items = [].slice.call(grid.querySelectorAll('.media-item'));
      var filters = [].slice.call(section.querySelectorAll('[data-filter]'));
      var visible = function () { return items.filter(function (li) { return !li.hidden; }); };
      var label = function () {
        items.forEach(function (li) {
          var btn = li.querySelector('.media-open');
          btn.setAttribute('aria-label', t(btn.hasAttribute('data-video') ? 'ui.galPlay' : 'ui.galView') + ': ' + capOf(li));
        });
      };
      filters.forEach(function (f) {
        f.addEventListener('click', function () {
          var type = f.getAttribute('data-filter');
          filters.forEach(function (o) { o.setAttribute('aria-pressed', String(o === f)); });
          items.forEach(function (li) {
            li.hidden = type !== 'all' && li.getAttribute('data-type') !== type;
            if (!li.hidden) { li.classList.add('is-visible'); }
          });
          feature();
        });
      });
      items.forEach(function (li) {
        li.querySelector('.media-open').addEventListener('click', function (e) {
          list = visible(); index = list.indexOf(li); opener = e.currentTarget;
          labelLightbox(); render();
          document.documentElement.style.overflow = 'hidden';
          if (lb.showModal) { lb.showModal(); } else { lb.setAttribute('open', ''); }
          closeBtn.focus();
        });
      });
      // Size items so the last row is always full: rows of three on wide screens, two on phones
      var feature = function () {
        var v = visible(), n = v.length, half = [], full = [], lead = null;
        items.forEach(function (li) { li.classList.remove('is-feature', 'is-half', 'is-full'); });
        if (twoUp.matches) {
          // Odd count: the first item runs the full width
          if (n % 2) { full = v.slice(0, 1); }
        } else if (n % 3 === 0) {
          if (wide.matches) { lead = v[0]; }
        } else if (n === 1) {
          full = v;
        } else {
          // One left over: the last four become two rows of two. Two left over: one row of two.
          half = v.slice(n % 3 === 1 ? -4 : -2);
        }
        if (lead) { lead.classList.add('is-feature'); }
        half.forEach(function (li) { li.classList.add('is-half'); });
        full.forEach(function (li) { li.classList.add('is-full'); });
      };
      [twoUp, wide].forEach(function (mq) { if (mq.addEventListener) { mq.addEventListener('change', feature); } else { mq.addListener(feature); } });
      feature();
      label();
      document.addEventListener('langchange', function () { label(); if (lb.open) { labelLightbox(); cap.textContent = capOf(list[index]); } });
    });
  }
})();
