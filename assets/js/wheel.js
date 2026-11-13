/* Gallery wheel for the Bawadi Al Dain and Arrahma pages (loaded after assets/js/site.js; styles in assets/css/wheel.css).
   1. Harvest Wheel: a 3D ring of the gallery's photos and videos that turns continuously by itself,
      settles on the nearest card while the visitor points at it, and can be paused, dragged, swiped
      or turned with the arrow keys. It is built from the gallery list already on the page and opens
      items in the shared lightbox. Only cards near the front load their images.
   2. Lightbox styling and motion for this page: a circular reveal from the item that was opened,
      a 3D swing between items, the item's collection and a progress line, and a short fade on close.
   Without JavaScript or 3D support the normal grid and lightbox are used. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var rtl = function () { return html.getAttribute('dir') === 'rtl'; };
  var lightbox = document.querySelector('dialog.lightbox');

  /* ====================== 1. Harvest Wheel ====================== */
  (function wheel() {
    var root = document.querySelector('[data-wheel]');
    if (!root) { return; }
    if (!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d'))) { return; }
    var section = root.closest('section');
    var grid = section && section.querySelector('[data-gallery]');
    if (!grid) { return; }
    var items = [].slice.call(grid.querySelectorAll('.media-item'));
    if (!items.length) { return; }

    var STEP = 21;       // degrees between neighbouring cards
    var SHOW = 4;        // cards drawn on each side of the front card
    var SPEED = 0.3;     // cards per second while turning by itself
    var ring = root.querySelector('.bw-wheel-ring');
    var stage = root.querySelector('.bw-wheel-stage');
    var chips = [].slice.call(root.querySelectorAll('[data-cat]'));
    var toggle = root.querySelector('[data-wheel-toggle]');
    var live = root.querySelector('[data-wheel-live]');
    var count = root.querySelector('.bw-wheel-count');
    var bar = root.querySelector('.bw-wheel-progress span');
    var playBtn = root.querySelector('[data-wheel-play]');
    var text = function (k) { var el = root.querySelector('[data-wheel-label="' + k + '"]'); return el ? el.textContent : ''; };
    var catName = function (c) {
      var el = root.querySelector('[data-cat="' + (c._video ? 'video' : c._cat) + '"] [data-i18n]');
      return el ? el.textContent : '';
    };
    var caption = function (c) { var p = c._li.querySelector('.media-cap'); return p ? p.textContent.trim() : ''; };
    var wrap = function (x, n) { return ((x % n) + n) % n; };

    // ---------- Cards ----------
    var cards = items.map(function (li) {
      var btn = li.querySelector('.media-open');
      var img = btn.querySelector('img');
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'bw-card';
      c.tabIndex = -1;
      c.innerHTML = '<span class="bw-card-img"></span><span class="bw-card-cap" aria-hidden="true"><small></small><b></b></span>';
      c._li = li; c._btn = btn;
      c._src = img ? img.src : '';
      c._ratio = img && +img.getAttribute('height') ? +img.getAttribute('width') / +img.getAttribute('height') : 0;
      c._video = btn.hasAttribute('data-video');
      c._cat = li.getAttribute('data-cat') || '';
      if (c._video) {
        c.insertAdjacentHTML('beforeend', '<span class="media-play" aria-hidden="true"></span>');
        var dur = btn.querySelector('.media-dur');
        if (dur) { c.appendChild(dur.cloneNode(true)); }
      }
      ring.appendChild(c);
      return c;
    });

    var list = [];
    function setList(cat) {
      list = cards.filter(function (c) { return cat === 'all' || (cat === 'video' ? c._video : c._cat === cat); });
      cards.forEach(function (c) { c._i = list.indexOf(c); c.hidden = c._i < 0; c._far = null; });
    }
    setList('all');

    // ---------- Motion state ----------
    var pos = 0, target = 0;
    var playing = !reduce.matches;
    var hover = false, kbFocus = false, lbOpen = false, dragging = false, inView = false, holdUntil = 0;
    var near = !('IntersectionObserver' in window);   // card images load only once the visitor scrolls close to the wheel
    var dirty = true, lastFront = -1;
    function moving() {
      return playing && !hover && !kbFocus && !lbOpen && !dragging && inView && !document.hidden && Date.now() > holdUntil;
    }
    function settle() { target = Math.round(pos); dirty = true; }
    function go(i) {
      var n = list.length; if (!n) { return; }
      var from = Math.round(target);
      var delta = wrap(i - wrap(from, n) + n / 2, n) - n / 2;
      target = from + Math.round(delta); dirty = true;
    }
    function step(d) { target = Math.round(target) + d; holdUntil = Date.now() + 6000; dirty = true; }

    // ---------- Drawing ----------
    function frontIndex() { return list.length ? wrap(Math.round(pos), list.length) : -1; }
    function updateFront() {
      var f = frontIndex(), n = list.length;
      cards.forEach(function (c) {
        var on = c._i === f && f > -1;
        c.classList.toggle('is-front', on);
        c.tabIndex = on ? 0 : -1;
        c.setAttribute('aria-label', (c._video ? text('video') : text('photo')) + ': ' + caption(c));
      });
      var fc = list[f];
      if (fc) {
        fc.querySelector('.bw-card-cap small').textContent = catName(fc);
        fc.querySelector('.bw-card-cap b').textContent = caption(fc);
        count.textContent = (f + 1) + ' / ' + n;
        if (!moving()) { live.textContent = caption(fc); }
      }
      lastFront = f;
    }
    // A photo much wider or taller than the cards is shown whole over a blurred copy of itself (wheel.css)
    var fitW = 0;
    function fitCards() {
      if (!ring.offsetHeight || ring.offsetWidth === fitW) { return; }
      fitW = ring.offsetWidth;
      var box = ring.offsetWidth / ring.offsetHeight;
      cards.forEach(function (c) { var k = c._ratio ? c._ratio / box : 1; c.classList.toggle('is-whole', k < 0.75 || k > 1.4); });
    }
    function layout() {
      var n = list.length, dir = rtl() ? -1 : 1;
      fitCards();
      cards.forEach(function (c) {
        if (c._i < 0) { return; }
        var d = wrap(c._i - pos + n / 2, n) - n / 2;
        var ad = Math.abs(d), far = ad > SHOW + 0.5;
        if (far !== c._far) {
          c._far = far;
          c.classList.toggle('is-far', far);
          c.setAttribute('aria-hidden', far ? 'true' : 'false');
        }
        if (far) { return; }
        var lift = Math.max(0, 1 - ad) * 34;
        c.style.transform = 'rotateY(' + (d * STEP * dir).toFixed(2) + 'deg) translateZ(var(--r)) translateZ(' + lift.toFixed(1) + 'px)';
        c.style.setProperty('--d', Math.min(ad, SHOW).toFixed(3));
        if (near && !c._loaded && c._src) { c.style.setProperty('--img', 'url("' + c._src + '")'); c._loaded = true; }
      });
      if (frontIndex() !== lastFront) { updateFront(); }
      bar.style.width = n ? ((wrap(Math.round(pos), n) + 1) / n * 100) + '%' : '0';
    }

    var last = performance.now(), raf = 0;
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (moving()) {
        pos += SPEED * dt; target = pos; dirty = true;
      } else if (!dragging) {
        var diff = target - pos;
        if (Math.abs(diff) > 0.001) { pos += diff * Math.min(1, dt * (reduce.matches ? 60 : 7)); dirty = true; }
        else if (pos !== target) { pos = target; dirty = true; }
      }
      if (dirty) { layout(); dirty = false; }
      raf = inView ? requestAnimationFrame(frame) : 0;
    }
    function run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    // ---------- Collections ----------
    chips.forEach(function (chip) {
      var cat = chip.getAttribute('data-cat');
      var n = chip.querySelector('.n');
      if (n) { n.textContent = cards.filter(function (c) { return cat === 'all' || (cat === 'video' ? c._video : c._cat === cat); }).length; }
      chip.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === chip)); });
        setList(cat); pos = target = 0; lastFront = -1; dirty = true;
        holdUntil = Date.now() + 2500;
        run();
      });
    });

    // ---------- Opening in the lightbox ----------
    var openedFrom = null;
    function open(c) {
      if (c._li.hidden) {   // the lightbox walks the grid's visible items
        var all = section.querySelector('.media-filter [data-filter="all"]');
        if (all) { all.click(); }
      }
      if (lightbox) {
        var r = c.getBoundingClientRect();
        lightbox.style.setProperty('--ox', (r.left + r.width / 2) + 'px');
        lightbox.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
      }
      openedFrom = c;
      c._btn.click();
    }
    if (lightbox) {
      new MutationObserver(function () {
        lbOpen = lightbox.hasAttribute('open');
        if (lbOpen) { settle(); }
        else if (openedFrom) { var c = openedFrom; openedFrom = null; setTimeout(function () { c.focus({ preventScroll: true }); }, 0); }
      }).observe(lightbox, { attributes: true, attributeFilter: ['open'] });
    }

    // ---------- Pointer: hover stops the wheel; drag turns it ----------
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; settle(); } });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; } });
    var startX = 0, startPos = 0, moved = false;
    var spacing = function () { var c = list[0]; return (c ? c.offsetWidth : 240) * 0.9; };
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) { return; }
      dragging = true; moved = false; startX = e.clientX; startPos = pos;
      stage.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) { return; }
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) { moved = true; }
      pos = startPos - (dx / spacing()) * (rtl() ? -1 : 1);
      dirty = true;
    });
    function endDrag() {
      if (!dragging) { return; }
      dragging = false; stage.classList.remove('is-dragging');
      settle(); holdUntil = Date.now() + 5000;
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    ring.addEventListener('click', function (e) {
      var c = e.target.closest('.bw-card');
      if (!c) { return; }
      if (moved) { moved = false; return; }
      if (c.classList.contains('is-front')) { open(c); } else { go(c._i); holdUntil = Date.now() + 6000; }
    });

    // ---------- Keyboard ----------
    root.addEventListener('focusin', function (e) {
      var t = e.target;
      kbFocus = !!(t.matches && t.matches(':focus-visible'));
      if (kbFocus) { settle(); }
    });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { kbFocus = false; } });
    // A mouse moving elsewhere on the page means the visitor is not reading the wheel with the keyboard
    document.addEventListener('pointermove', function (e) {
      if (kbFocus && e.pointerType === 'mouse' && !root.contains(e.target) && !lbOpen) { kbFocus = false; }
    });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        step((e.key === 'ArrowRight' ? 1 : -1) * (rtl() ? -1 : 1));
        setTimeout(function () { var f = list[wrap(Math.round(target), list.length)]; if (f) { f.focus({ preventScroll: true }); } }, 0);
      } else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(list.length - 1); }
    });
    [].slice.call(root.querySelectorAll('[data-step]')).forEach(function (b) {
      b.addEventListener('click', function () { step(+b.getAttribute('data-step')); run(); });
    });

    // ---------- Pause / play ----------
    function labelPlay() {
      playBtn.setAttribute('aria-pressed', String(playing));
      playBtn.setAttribute('aria-label', playing ? text('pause') : text('play'));
      root.classList.toggle('is-paused', !playing);
      live.setAttribute('aria-live', playing ? 'off' : 'polite');
    }
    playBtn.addEventListener('click', function () { playing = !playing; if (!playing) { settle(); } holdUntil = 0; labelPlay(); run(); });
    reduce.addEventListener && reduce.addEventListener('change', function () { if (reduce.matches) { playing = false; settle(); labelPlay(); } });

    // ---------- Only animate while the wheel is on screen ----------
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) { run(); } }, { threshold: 0.2 }).observe(stage);
      var nearObs = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { near = true; dirty = true; layout(); nearObs.disconnect(); }
      }, { rootMargin: '900px 0px' });
      nearObs.observe(stage);
    } else { inView = true; }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { run(); } });

    // ---------- Full grid ----------
    toggle.addEventListener('click', function () {
      var show = !section.classList.contains('wheel-all');
      section.classList.toggle('wheel-all', show);
      toggle.setAttribute('aria-expanded', String(show));
      toggle.children[0].hidden = show;
      toggle.children[1].hidden = !show;
    });

    // ---------- Language changes: redraw in the new direction with new captions ----------
    if ('MutationObserver' in window) {
      new MutationObserver(function () { setTimeout(function () { lastFront = -1; dirty = true; labelPlay(); run(); }, 0); })
        .observe(html, { attributes: true, attributeFilter: ['lang', 'dir'] });
    }

    root.hidden = false;
    section.classList.add('wheel-on');
    labelPlay();
    layout();
    run();
  })();

  /* ====================== 2. Lightbox for this page ====================== */
  (function fancyLightbox() {
    if (!lightbox || !document.querySelector('[data-wheel]')) { return; }
    lightbox.classList.add('lb-fancy');
    var stage = lightbox.querySelector('.lb-stage');
    var counter = lightbox.querySelector('.lb-count');
    lightbox.insertAdjacentHTML('afterbegin',
      '<span class="lb-leaf lb-leaf-a" aria-hidden="true"></span><span class="lb-leaf lb-leaf-b" aria-hidden="true"></span>' +
      '<p class="lb-cat" aria-hidden="true"></p><div class="lb-progress" aria-hidden="true"><span></span></div>');
    var cat = lightbox.querySelector('.lb-cat');
    var prog = lightbox.querySelector('.lb-progress span');
    var dir = 'open';

    // Where the reveal starts: the grid tile that was clicked (the wheel sets it for its own cards)
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-gallery] .media-open');
      if (!b) { return; }
      var r = b.getBoundingClientRect();
      if (r.width) {
        lightbox.style.setProperty('--ox', (r.left + r.width / 2) + 'px');
        lightbox.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
      }
      dir = 'open';
    }, true);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { dir = 'prev'; }, true);
    lightbox.querySelector('.lb-next').addEventListener('click', function () { dir = 'next'; }, true);
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { dir = rtl() ? 'prev' : 'next'; }
      if (e.key === 'ArrowLeft') { dir = rtl() ? 'next' : 'prev'; }
    }, true);

    // Each new item swings in from the side the visitor is moving towards
    var catLabel = function (key) {
      var el = document.querySelector('[data-wheel] [data-cat="' + key + '"] [data-i18n]');
      return el ? el.textContent : '';
    };
    new MutationObserver(function () {
      var media = stage.firstElementChild;
      if (!media) { return; }
      stage.setAttribute('data-dir', dir);
      dir = 'next';
      // replay the caption's rise for each new item
      var capEl = lightbox.querySelector('.lb-cap');
      capEl.style.animation = 'none'; void capEl.offsetWidth; capEl.style.animation = '';
      var src = media.getAttribute('src') || '';
      var li = null;
      [].slice.call(document.querySelectorAll('[data-gallery] .media-open')).some(function (b) {
        var f = b.getAttribute('data-full') || b.getAttribute('data-video');
        if (f && src.indexOf(f.replace(/^\.\//, '')) > -1) { li = b.closest('.media-item'); return true; }
        return false;
      });
      cat.textContent = li ? catLabel(li.getAttribute('data-type') === 'video' ? 'video' : li.getAttribute('data-cat')) : '';
      var m = (counter.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
      prog.style.width = m ? (m[1] / m[2] * 100) + '%' : '0';
    }).observe(stage, { childList: true });

    // A short fade on close (Esc, the close button or a click outside the picture)
    function closeAnimated(e) {
      if (reduce.matches || !lightbox.open) { return; }
      e.preventDefault(); e.stopImmediatePropagation();
      if (lightbox.classList.contains('lb-out')) { return; }
      lightbox.classList.add('lb-out');
      setTimeout(function () { lightbox.classList.remove('lb-out'); lightbox.close(); }, 280);
    }
    lightbox.querySelector('.lb-close').addEventListener('click', closeAnimated, true);
    lightbox.addEventListener('cancel', closeAnimated);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target === stage) { closeAnimated(e); } }, true);
  })();
})();
