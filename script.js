(function () {
  'use strict';

  /* ===== CONFIG: replace with your own address when you reuse this template ===== */
  var CONTACT_EMAIL = 'hello@nexora-demo.example';

  document.documentElement.classList.add('js');
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */
  var header = $('header'), burger = $('burger'), links = $('nav-links');
  function setMenu(open) {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960) setMenu(false); });

  function onScroll() { header.classList.toggle('solid', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active link, reveal, counters ---------- */
  var navLinks = links.querySelectorAll('a[href^="#"]:not(.btn)');
  function countUp(el) {
    var target = parseInt(el.dataset.target, 10), start = null, dur = 1400;
    if (reduce) { el.textContent = target; return; }
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'about', 'services', 'work', 'contact'].forEach(function (id) { var s = $(id); if (s) spy.observe(s); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.querySelectorAll('.count').forEach(countUp); co.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    var stats = document.querySelector('.stats');
    if (stats) co.observe(stats);
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Collapsibles: project cards + FAQ ---------- */
  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', String(open));
    var panel = $(btn.getAttribute('aria-controls'));
    if (panel) panel.classList.toggle('open', open);
    if (btn.classList.contains('toggle')) {
      btn.firstChild.nodeValue = open ? 'Hide case study' : 'View case study';
    }
  }
  document.querySelectorAll('.toggle').forEach(function (btn) {
    btn.addEventListener('click', function () { setOpen(btn, btn.getAttribute('aria-expanded') !== 'true'); });
  });
  var accBtns = document.querySelectorAll('.acc-btn');
  accBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      accBtns.forEach(function (b) { setOpen(b, false); });
      setOpen(btn, willOpen);
    });
  });

  /* ---------- Contact form: validation + mailto fallback ---------- */
  var form = $('contact-form'), draft = $('draft'), status = $('status');

  function setError(id, msg) {
    var f = $(id);
    $(id + '-err').textContent = msg;
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function validate() {
    var v = {
      name: $('name').value.trim(), email: $('email').value.trim(), business: $('business').value.trim(),
      type: $('type').value, budget: $('budget').value, message: $('message').value.trim()
    };
    var ok = true;
    ok = setError('name', v.name.length < 2 ? 'Enter your full name.' : '') && ok;
    ok = setError('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) ? '' : 'Enter a valid email address, for example name@company.com.') && ok;
    ok = setError('type', v.type ? '' : 'Select a project type.') && ok;
    ok = setError('budget', v.budget ? '' : 'Select a budget range.') && ok;
    ok = setError('message', v.message.length < 20 ? 'Tell us a little more (at least 20 characters).' : '') && ok;
    return ok ? v : null;
  }
  ['name', 'email', 'type', 'budget', 'message'].forEach(function (id) {
    $(id).addEventListener('input', function () { if (this.getAttribute('aria-invalid') === 'true') validate(); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var v = validate();
    if (!v) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); draft.hidden = true; return; }
    var subject = 'Project enquiry: ' + v.type + ' (' + (v.business || v.name) + ')';
    var body = 'Hello NEXORA team,\n\n' +
      'Name: ' + v.name + '\n' +
      'Email: ' + v.email + '\n' +
      'Business: ' + (v.business || 'Not provided') + '\n' +
      'Project type: ' + v.type + '\n' +
      'Budget range: ' + v.budget + '\n\n' +
      'Message:\n' + v.message + '\n';
    $('draft-to').textContent = CONTACT_EMAIL;
    $('draft-text').textContent = 'Subject: ' + subject + '\n\n' + body;
    $('draft-link').href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    draft.hidden = false;
    draft.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });

  $('copy').addEventListener('click', function () {
    var text = $('draft-text').textContent;
    function done(ok) { status.textContent = ok ? 'Draft copied. Paste it into your email app.' : 'Copy failed. Select the text above and copy it manually.'; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  });

  $('year').textContent = new Date().getFullYear();
})();
