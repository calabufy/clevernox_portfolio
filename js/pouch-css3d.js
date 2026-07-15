// Интерактивный псевдо-3D дой-пак на чистом CSS 3D (transform-style: preserve-3d),
// без Three.js и WebGL. Каркас-контейнер [data-pouch-viewer] отдаёт build.js;
// здесь по конфигу из data-* строится геометрия: лицевая и задняя панели из
// N вертикальных полос-слайсов, повёрнутых по дуге (общая текстура, сдвиг
// background-position по ширине полосы), боковые швы, верхняя запайка и овальное
// донышко. Вращение — pointer + инерция через requestAnimationFrame, без CSS-
// transition. Без JS / при prefers-reduced-motion показывается статичный cover.
(function () {
  var scenes = document.querySelectorAll("[data-pouch-viewer]");
  if (!scenes.length) return;

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return; // оставляем статичный fallback, сцену не строим

  var DEG = 180 / Math.PI;

  scenes.forEach(function (scene) {
    var fig = scene.closest(".pouch3d");
    var W = parseFloat(scene.dataset.w);
    var H = parseFloat(scene.dataset.h);
    var bulge = parseFloat(scene.dataset.bulge) || 0.12;
    var N = parseInt(scene.dataset.slices, 10) || 14;
    var front = scene.dataset.front;
    var back = scene.dataset.back || front;
    var left = scene.dataset.left;
    var right = scene.dataset.right;
    if (!W || !H || !front) return;

    // --- Геометрия дуги панели (круговой сегмент) -----------------------------
    // Хорда = ширина панели W, стрела прогиба s = bulge·W. По ним радиус дуги R
    // и полуугол thetaMax; центр окружности на оси z в точке z0 (перед выгнут к +z).
    var s = bulge * W;
    var R = (W * W / 4 + s * s) / (2 * s);
    var thetaMax = Math.asin(W / 2 / R);
    var z0 = s - R;
    var D = 2 * s; // глубина наполненного пуза = глубина овального дна

    var pouch = document.createElement("div");
    pouch.className = "pouch";

    // Одна панель = N плоских полос, каждая касательна дуге в своём угле beta.
    // Ширина полосы = хорда углового сегмента (+перекрытие, чтобы не было щелей).
    // Текстура одна на панель: сдвигаем background-position на ширину полосы.
    // У задней панели порядок полос обратный (её видно с изнанки) и разворот
    // rotateY(180 - beta), чтобы нормаль смотрела наружу в −z.
    function buildPanel(img, isBack) {
      var sliceW = 2 * R * Math.sin(thetaMax / N) + 1;
      for (var i = 0; i < N; i++) {
        var beta = -thetaMax + (i + 0.5) * (2 * thetaMax / N);
        var deg = beta * DEG;
        var x = R * Math.sin(beta);
        var zFront = z0 + R * Math.cos(beta);
        var z = isBack ? -zFront : zFront;
        var yaw = isBack ? 180 - deg : deg;
        var band = isBack ? N - 1 - i : i; // индекс текстурной полосы
        var shade = Math.abs(beta) / thetaMax; // к краям панели темнее

        var sl = document.createElement("div");
        sl.className = "pouch-slice";
        sl.style.width = sliceW.toFixed(2) + "px";
        sl.style.height = H + "px";
        sl.style.marginLeft = (-sliceW / 2).toFixed(2) + "px";
        sl.style.marginTop = (-H / 2).toFixed(2) + "px";
        sl.style.transform =
          "translate3d(" + x.toFixed(2) + "px,0," + z.toFixed(2) + "px) " +
          "rotateY(" + yaw.toFixed(3) + "deg)";
        sl.style.backgroundImage = "url(" + img + ")";
        sl.style.backgroundSize = W + "px " + H + "px";
        sl.style.backgroundPosition = (-band * (W / N)).toFixed(2) + "px 0";

        // Фейковое освещение: полупрозрачная «чернильная» вуаль, гуще к бокам.
        var sh = document.createElement("i");
        sh.className = "pouch-shade";
        sh.style.opacity = (shade * 0.4).toFixed(3);
        sl.appendChild(sh);
        pouch.appendChild(sl);
      }
    }

    buildPanel(back, true); // сначала дальняя панель
    buildPanel(front, false);

    // Боковые швы — узкие вертикальные грани по краям (x = ±W/2), повёрнуты
    // rotateY(±90) лицом наружу; текстура — фото края арта, если задана.
    function buildSeam(img, sign) {
      var el = document.createElement("div");
      el.className = "pouch-seam";
      el.style.width = "10px";
      el.style.height = H + "px";
      el.style.marginLeft = "-5px";
      el.style.marginTop = (-H / 2).toFixed(2) + "px";
      el.style.transform =
        "translate3d(" + (sign * W / 2).toFixed(2) + "px,0,0) rotateY(" +
        sign * 90 + "deg)";
      if (img) {
        el.style.backgroundImage = "url(" + img + ")";
        el.style.backgroundSize = "cover";
      }
      pouch.appendChild(el);
    }
    buildSeam(left, -1);
    buildSeam(right, 1);

    // Верхняя запайка — плоская планка поперёк ширины в плоскости z=0.
    var seal = document.createElement("div");
    seal.className = "pouch-seal";
    seal.style.width = W + "px";
    seal.style.height = "16px";
    seal.style.marginLeft = (-W / 2).toFixed(2) + "px";
    seal.style.marginTop = "-8px";
    seal.style.transform = "translate3d(0," + (-H / 2).toFixed(2) + "px,0)";
    pouch.appendChild(seal);

    // Овальное донышко-подставка — эллипс W×D, положенный горизонтально.
    var base = document.createElement("div");
    base.className = "pouch-base";
    base.style.width = W + "px";
    base.style.height = D.toFixed(2) + "px";
    base.style.marginLeft = (-W / 2).toFixed(2) + "px";
    base.style.marginTop = (-D / 2).toFixed(2) + "px";
    base.style.transform =
      "translate3d(0," + (H / 2).toFixed(2) + "px,0) rotateX(90deg)";
    pouch.appendChild(base);

    scene.appendChild(pouch);
    scene.classList.add("is-live");
    if (fig) fig.classList.add("is-live");

    // --- Вращение + инерция ---------------------------------------------------
    var ry = -26, rx = -12, vy = 0;
    var dragging = false, interacted = false, lastX = 0, lastY = 0;

    function apply() {
      pouch.style.setProperty("--ry", ry.toFixed(2) + "deg");
      pouch.style.setProperty("--rx", rx.toFixed(2) + "deg");
    }
    function clampPitch(v) { return Math.max(-20, Math.min(20, v)); }

    function frame() {
      if (!dragging) {
        if (!interacted) {
          ry += 0.18; // медленное автовращение до первого касания
        } else if (vy) {
          ry += vy;
          vy *= 0.95; // затухание инерции
          if (Math.abs(vy) < 0.01) vy = 0;
        }
        apply();
      }
      requestAnimationFrame(frame);
    }
    apply();
    requestAnimationFrame(frame);

    scene.addEventListener("pointerdown", function (e) {
      dragging = true;
      interacted = true;
      vy = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      if (scene.setPointerCapture && e.pointerId != null) {
        scene.setPointerCapture(e.pointerId);
      }
    });
    scene.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      ry += dx * 0.4;
      vy = dx * 0.4;
      rx = clampPitch(rx - dy * 0.3);
      apply();
    });
    function release() { dragging = false; }
    scene.addEventListener("pointerup", release);
    scene.addEventListener("pointercancel", release);

    // Клавиатура для доступности.
    scene.tabIndex = 0;
    scene.setAttribute("role", "img");
    scene.addEventListener("keydown", function (e) {
      var step = 8;
      if (e.key === "ArrowLeft") ry -= step;
      else if (e.key === "ArrowRight") ry += step;
      else if (e.key === "ArrowUp") rx = clampPitch(rx - step);
      else if (e.key === "ArrowDown") rx = clampPitch(rx + step);
      else return;
      e.preventDefault();
      interacted = true;
      vy = 0;
      apply();
    });
  });
})();
