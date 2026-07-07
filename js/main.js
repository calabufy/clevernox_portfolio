// Бургер-меню
(function () {
  var burger = document.querySelector(".nav-burger");
  var links = document.querySelector(".nav-links");
  if (!burger || !links) return;

  burger.addEventListener("click", function () {
    var open = links.getAttribute("data-open") === "true";
    links.setAttribute("data-open", String(!open));
    burger.setAttribute("aria-expanded", String(!open));
  });

  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.setAttribute("data-open", "false");
      burger.setAttribute("aria-expanded", "false");
    });
  });
})();

// Появление блоков при скролле (прогрессивное улучшение — без JS всё видно сразу)
(function () {
  var items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach(function (el) { observer.observe(el); });
})();
