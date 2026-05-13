/* ─────────────────────────────────────────────────────────────────────────────
   The Protein Budget — scroll-theme.js
   Loaded via extend_head.html with defer attribute.
   Handles:
     1. Header shadow on scroll
     2. Smooth scroll for anchor links (e.g. #recipe jump links)
     3. Scroll-to-top button visibility
───────────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  // ── 1. Header shadow on scroll ───────────────────────────────────────────
  var header = document.querySelector("header");
  var SCROLL_THRESHOLD = 40;

  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  // ── 2. Scroll-to-top button visibility ──────────────────────────────────
  var scrollTopBtn = document.querySelector("[data-scroll-to-top]");

  function handleScrollTopVisibility() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 400) {
      scrollTopBtn.style.opacity = "1";
      scrollTopBtn.style.pointerEvents = "auto";
    } else {
      scrollTopBtn.style.opacity = "0";
      scrollTopBtn.style.pointerEvents = "none";
    }
  }

  // ── 3. Throttled scroll listener ────────────────────────────────────────
  var ticking = false;

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handleHeaderScroll();
        handleScrollTopVisibility();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Run once on load to set correct initial state
  handleHeaderScroll();
  handleScrollTopVisibility();

  // ── 4. Smooth scroll for internal anchor links ──────────────────────────
  document.addEventListener("click", function (e) {
    var target = e.target.closest("a[href^='#']");
    if (!target) return;

    var id = target.getAttribute("href").substring(1);
    var destination = document.getElementById(id);
    if (!destination) return;

    e.preventDefault();

    // Offset for sticky header height
    var headerHeight = header ? header.offsetHeight : 0;
    var elementTop = destination.getBoundingClientRect().top + window.scrollY;
    var offsetTop = elementTop - headerHeight - 16;

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });

    // Update URL hash without triggering a jump
    history.pushState(null, "", "#" + id);
  });
})();