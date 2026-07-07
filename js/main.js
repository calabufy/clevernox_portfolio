// Portfolio — main.js
// Two jobs only, per the brief: mobile burger menu, and a light
// scroll-reveal for section entrances. No frameworks.

(function () {
  "use strict";

  /* ---------- burger menu ---------- */
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");

  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      links.setAttribute("data-open", String(!open));
    });

    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        links.setAttribute("data-open", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // No IntersectionObserver support: show everything immediately.
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
