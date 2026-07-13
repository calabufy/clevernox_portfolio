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

// Интерактивный 3D-макет товара: перетаскивание для вращения + лёгкое авто-вращение.
// Прогрессивное улучшение: без JS модель просто статична в стартовом ракурсе.
(function () {
  var stages = document.querySelectorAll("[data-viz3d]");
  if (!stages.length) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stages.forEach(function (fig) {
    var stage = fig.querySelector(".viz3d-stage");
    var obj = fig.querySelector(".viz3d-obj");
    if (!stage || !obj) return;

    var ry = -28, rx = -16;      // текущий ракурс, град.
    var startRy = 0, startRx = 0, startX = 0, startY = 0;
    var dragging = false, interacted = false, autoId = 0;

    function apply() {
      obj.style.setProperty("--ry", ry.toFixed(2) + "deg");
      obj.style.setProperty("--rx", rx.toFixed(2) + "deg");
    }
    function clampPitch(v) { return Math.max(-32, Math.min(24, v)); }

    // Медленное авто-вращение по оси Y, пока пользователь не тронул модель.
    function autoStep() {
      if (dragging || interacted) return;
      ry += 0.22;
      apply();
      autoId = requestAnimationFrame(autoStep);
    }
    if (!reduce) autoId = requestAnimationFrame(autoStep);

    function onDown(e) {
      dragging = true;
      interacted = true;
      fig.classList.add("interacted");
      cancelAnimationFrame(autoId);
      var p = e.touches ? e.touches[0] : e;
      startX = p.clientX; startY = p.clientY;
      startRy = ry; startRx = rx;
      stage.setPointerCapture && e.pointerId != null && stage.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!dragging) return;
      var p = e.touches ? e.touches[0] : e;
      ry = startRy + (p.clientX - startX) * 0.5;
      rx = clampPitch(startRx - (p.clientY - startY) * 0.35);
      apply();
    }
    function onUp() { dragging = false; }

    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // Клавиатура для доступности (модель фокусируема).
    stage.tabIndex = 0;
    stage.setAttribute("role", "img");
    stage.addEventListener("keydown", function (e) {
      var step = 8;
      if (e.key === "ArrowLeft") ry -= step;
      else if (e.key === "ArrowRight") ry += step;
      else if (e.key === "ArrowUp") rx = clampPitch(rx - step);
      else if (e.key === "ArrowDown") rx = clampPitch(rx + step);
      else return;
      e.preventDefault();
      interacted = true;
      fig.classList.add("interacted");
      cancelAnimationFrame(autoId);
      apply();
    });

    apply();
  });
})();
