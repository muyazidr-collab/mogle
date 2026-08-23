/* =========================================================
   MOGLE, script utama
   Tanpa dependensi. Semua fitur bersifat progressive enhancement:
   halaman tetap bisa dibaca meski JavaScript dimatikan.
   ========================================================= */
(function () {
  'use strict';

  var header    = document.getElementById('header');
  var nav       = document.getElementById('nav');
  var hamburger = document.getElementById('hamburger');

  /* ---------- 1. Menu mobile ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });

    // Tutup setelah memilih tautan
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Tutup dengan Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        hamburger.focus();
      }
    });

    // Tutup saat klik di luar menu
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || hamburger.contains(e.target)) return;
      setMenu(false);
    });
  }

  /* ---------- 2. Header saat digulir ---------- */
  function updateHeader() {
    header.classList.toggle('is-stuck', window.scrollY > 12);
  }

  /* ---------- 3. Tautan navigasi aktif (scrollspy) ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var targets = links
    .map(function (link) {
      var id = link.getAttribute('href');
      var section = id && id.charAt(0) === '#' ? document.querySelector(id) : null;
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  function updateActiveLink() {
    var offset = window.scrollY + (header.offsetHeight || 76) + 120;
    var current = null;

    targets.forEach(function (item) {
      if (item.section.offsetTop <= offset) current = item;
    });

    // Section terakhir dianggap aktif saat sudah di dasar halaman
    var atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 4;
    if (atBottom && targets.length) current = targets[targets.length - 1];

    targets.forEach(function (item) {
      item.link.classList.toggle('is-active', item === current);
    });
  }

  /* ---------- 4. Satu listener scroll, di-throttle rAF ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      updateActiveLink();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- 5. Animasi muncul saat digulir ---------- */
  var revealables = document.querySelectorAll('[data-reveal]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    // Fallback: tampilkan semuanya
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(revealables, function (el, i) {
      // Jeda kecil berurutan agar elemen bersaudara muncul bergantian
      el.style.transitionDelay = (i % 4) * 90 + 'ms';
      observer.observe(el);
    });

    // Jaring pengaman: pastikan apa pun yang sudah berada di layar saat halaman
    // selesai dimuat ikut tampil, termasuk saat halaman dibuka lewat anchor (#id).
    window.addEventListener('load', function () {
      Array.prototype.forEach.call(revealables, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      });
    });
  }

  /* ---------- 6. Tahun berjalan di footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
