#!/usr/bin/env node
// Генератор статических HTML-страниц из data/categories.js и data/works.js.
// Без внешних зависимостей: подстановка плейсхолдеров через String.replace.
// Запуск: node build.js

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const categories = require("./data/categories.js");
const works = require("./data/works.js");

const categoryTemplate = fs.readFileSync(path.join(ROOT, "templates/category.html"), "utf8");
const workTemplate = fs.readFileSync(path.join(ROOT, "templates/work.html"), "utf8");

function fill(template, values) {
  let out = template;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

function worksByCategory(slug) {
  return works.filter((w) => w.category === slug);
}

const REGMARK_HEART = "M0,4.3C-1.8,2.3 -4.3,0.4 -4.3,-2.1C-4.3,-3.9 -2.9,-5.2 -1.3,-5.2C-0.5,-5.2 0,-4.6 0,-4.1C0,-4.6 0.5,-5.2 1.3,-5.2C2.9,-5.2 4.3,-3.9 4.3,-2.1C4.3,0.4 1.8,2.3 0,4.3Z";

function regmark() {
  return `<svg class="regmark" viewBox="0 0 24 24" aria-hidden="true"><path transform="translate(12,6.1)" d="${REGMARK_HEART}"/><path transform="translate(17.9,12) rotate(90)" d="${REGMARK_HEART}"/><path transform="translate(12,17.9) rotate(180)" d="${REGMARK_HEART}"/><path transform="translate(6.1,12) rotate(-90)" d="${REGMARK_HEART}"/></svg>`;
}

function renderWorkCard(work) {
  return `      <a class="work-card" href="work-${work.slug}.html">
        <div class="work-card-media">
          <img src="${work.cardCover || work.cover}" alt="${work.cardAlt}">
          ${regmark()}
        </div>
        <div class="work-card-meta">
          <h2 class="work-card-title">${work.title}</h2>
          <span class="work-card-type">${work.type}</span>
        </div>
      </a>`;
}

function renderCategoryBody(category, categoryWorks) {
  const label = `Работы направления «${category.title}»`;
  if (categoryWorks.length === 0) {
    return `  <section class="container reveal" aria-label="${label}" style="padding-bottom: clamp(48px, 6vw, 72px);">

    <div class="empty-state">
      <strong>Работы этого направления скоро появятся</strong>
      <p>Первые проекты в категории «${category.title.toLowerCase()}» будут добавлены по мере наполнения портфолио — карточки работ появятся здесь по тому же шаблону, что и в «Айдентике».</p>
    </div>

    <div class="back-link-row">
      <a class="text-link" href="index.html#directions">← Назад к направлениям</a>
    </div>
  </section>`;
  }

  const cards = categoryWorks.map(renderWorkCard).join("\n\n");
  // Обложки направления «Реклама» портретные (3:4) — карточки сетки используют
  // этот же аспект вместо альбомного 4:3 по умолчанию (см. .work-grid--portrait в style.css).
  const gridClass = PORTRAIT_GRID_CATEGORIES.includes(category.slug) ? "work-grid work-grid--portrait" : "work-grid";
  return `  <section class="container reveal" aria-label="${label}" style="padding-bottom: clamp(48px, 6vw, 72px);">
    <div class="${gridClass}">

${cards}

      <!--
        Шаблон карточки для новой работы этого направления — скопировать блок
        <a class="work-card">…</a> выше, заменить cover, alt, ссылку, название и тип.
      -->

    </div>

    <div class="back-link-row">
      <a class="text-link" href="index.html#directions">← Назад к направлениям</a>
    </div>
  </section>`;
}

function renderCategoryPage(category) {
  const categoryWorks = worksByCategory(category.slug);
  return fill(categoryTemplate, {
    PAGE_TITLE: `${category.title} — работы — CLEVERNOX`,
    META_DESCRIPTION: category.metaDescription,
    CATEGORY_TITLE: category.title,
    CATEGORY_BLURB: category.blurb,
    BODY_SECTION: renderCategoryBody(category, categoryWorks),
  });
}

function renderIdeaParagraphs(idea) {
  return idea.paragraphs.map((p) => `          <p>${p}</p>`).join("\n");
}

function renderIdeaFigures(idea) {
  return idea.figures
    .map(
      (f) => `          <figure>
            <img src="${f.img}" alt="${f.alt}">
            <figcaption>${f.caption}</figcaption>
          </figure>`
    )
    .join("\n");
}

function renderIdeaExtras(idea) {
  const parts = [];
  if (idea.quote) {
    parts.push(`        <p class="process-quote">${idea.quote}</p>`);
  }
  if (idea.figures && idea.figures.length > 0) {
    parts.push(`        <div class="case-process-figures">
${renderIdeaFigures(idea)}
        </div>`);
  }
  return parts.join("\n");
}

// Исходники приходят в виде карточек 1200×1600 px — на странице кейса их
// показываем вполовину физического размера. Карточка в сетке направления
// (work-grid) никогда не уменьшается — правило касается только case-page.
// Ограничиваем через max-width (не width/height-атрибуты): у .result-gallery img
// в CSS нет height:auto, поэтому фиксированный height-атрибут сплющивает картинку —
// max-width сохраняет пропорции без изменения style.css.
//
// «Инфографика» — уменьшаются и обложка, и все картинки результата (галерея).
// «Реклама» — уменьшается только обложка кейса, галерея остаётся в полный размер.
const HALF_COVER_CATEGORIES = ["infographics", "ads"];
const HALF_GALLERY_CATEGORIES = ["infographics"];
const NATIVE_WIDTH = 1200;
const HALF_SIZE_ATTR = ` style="max-width:${NATIVE_WIDTH / 2}px"`;

// Категории, где cover-изображения портретные (3:4) — карточки в сетке направления
// используют этот же аспект вместо альбомного 4:3 по умолчанию.
const PORTRAIT_GRID_CATEGORIES = ["ads"];

function coverSizeAttr(category) {
  return HALF_COVER_CATEGORIES.includes(category) ? HALF_SIZE_ATTR : "";
}

function caseImageSizeAttr(category) {
  return HALF_GALLERY_CATEGORIES.includes(category) ? HALF_SIZE_ATTR : "";
}

function renderGallery(gallery, category) {
  const sizeAttr = caseImageSizeAttr(category);
  return gallery
    .map((block) => {
      if (block.layout === "full") {
        return `        <img class="full" src="${block.img}" alt="${block.alt}"${sizeAttr}>`;
      }
      const items = block.items
        .map((it) => `          <img src="${it.img}" alt="${it.alt}"${sizeAttr}>`)
        .join("\n");
      return `        <div class="pair-row">
${items}
        </div>`;
    })
    .join("\n");
}

// Секция «Результат» из шаблона (templates/work.html). Если у кейса нет галерейных
// изображений (только обложка), вырезаем её из готового HTML целиком — иначе на
// странице остаётся пустой заголовок «Результат» без картинок. Делаем это пост-
// обработкой строки, а не через плейсхолдер, чтобы не трогать сам шаблон.
// Умеренно-ленивый шаблон `(?:(?!</section>)[\s\S])*?` не даёт совпадению
// пересечь границу </section>, поэтому «Результат» привязан к своей секции, а не
// подхватывается начиная с «Контекста»/«Идеи» (иначе вырезались бы и они —
// у работ без галереи, например упаковок LUNKA/NOX).
const RESULT_SECTION_RE =
  /\n\n {2}<section class="container case-section reveal">\n {4}<div class="case-section-grid">\n {6}<span class="eyebrow">(?:(?!<\/section>)[\s\S])*?Результат<\/span>[\s\S]*?<\/section>/;

// Интерактивный 3D-макет готового товара на чистых CSS-трансформах (без 3D-библиотек).
// Тип "box" — параллелепипед из шести граней (упаковка-коробка), тип "cylinder" —
// гранёный цилиндр с обёрнутой круговой этикеткой (бутылка/банка). Вся геометрия
// (translateZ, rotateY сегментов) считается здесь и уходит в inline-стили — CSS
// отвечает только за перспективу, освещение и вращение по --rx/--ry (js/main.js).
function renderBox(m) {
  const { w, h, d } = m.size;
  const f = m.faces;
  // Верхний торец: если в развёртке есть панель крышки — кладём её картинкой,
  // иначе остаётся сплошной цвет --cap (как и нижний торец).
  const topStyle = f.top
    ? ` style="background-image:url(${f.top});background-size:cover;background-color:var(--cap)"`
    : "";
  return `          <div class="viz3d-obj viz3d-box" style="--w:${w}px;--h:${h}px;--d:${d}px;--cap:${m.cap};">
            <div class="viz3d-face f-front" style="background-image:url(${f.front})"></div>
            <div class="viz3d-face f-back" style="background-image:url(${f.back})"></div>
            <div class="viz3d-face f-right" style="background-image:url(${f.right})"></div>
            <div class="viz3d-face f-left" style="background-image:url(${f.left})"></div>
            <div class="viz3d-face f-top"${topStyle}></div>
            <div class="viz3d-face f-bottom"></div>
          </div>`;
}

function renderCylinder(m) {
  const N = 40; // граней в цилиндре тела
  const r = 70; // радиус тела, px
  const bodyH = 300; // высота стеклянного тела
  const bandH = 200; // высота полосы этикетки (95 мм в том же масштабе)
  const circ = 2 * Math.PI * r;
  const w = circ / N; // ширина одной грани
  const tz = r * Math.cos(Math.PI / N); // расстояние до центра грани (апофема)
  const capR = 42;
  const capH = 60;
  const capN = 24;
  const capTz = capR * Math.cos(Math.PI / capN);
  const capY = -(bodyH / 2 + capH / 2);

  const bodySegs = [];
  for (let i = 0; i < N; i++) {
    const rot = ((360 / N) * i).toFixed(3);
    const bgx = (-i * w).toFixed(2);
    bodySegs.push(
      `            <div class="viz3d-seg" style="width:${(w + 0.7).toFixed(2)}px;height:${bodyH}px;transform:translate(-50%,-50%) rotateY(${rot}deg) translateZ(${tz.toFixed(2)}px);background-image:url(${m.label});background-size:${circ.toFixed(1)}px ${bandH}px;background-position:${bgx}px center;"></div>`
    );
  }
  const capSegs = [];
  for (let i = 0; i < capN; i++) {
    const rot = ((360 / capN) * i).toFixed(3);
    capSegs.push(
      `            <div class="viz3d-seg viz3d-cap-seg" style="width:${(2 * capR * Math.tan(Math.PI / capN) + 0.7).toFixed(2)}px;height:${capH}px;transform:translate(-50%,-50%) translateY(${capY}px) rotateY(${rot}deg) translateZ(${capTz.toFixed(2)}px);"></div>`
    );
  }

  return `          <div class="viz3d-obj viz3d-cyl" style="--r:${r}px;--bodyH:${bodyH}px;--capR:${capR}px;">
            <div class="viz3d-disc body-top" style="width:${2 * r}px;height:${2 * r}px;transform:translate(-50%,-50%) rotateX(90deg) translateZ(${bodyH / 2}px)"></div>
            <div class="viz3d-disc body-bottom" style="width:${2 * r}px;height:${2 * r}px;transform:translate(-50%,-50%) rotateX(-90deg) translateZ(${bodyH / 2}px)"></div>
${bodySegs.join("\n")}
            <div class="viz3d-disc cap-top" style="width:${2 * capR}px;height:${2 * capR}px;transform:translate(-50%,-50%) translateY(${-(bodyH / 2 + capH)}px) rotateX(90deg) translateZ(${capR}px)"></div>
${capSegs.join("\n")}
          </div>`;
}

// Тип "pouch" — стоячий дой-пак / плоский пакет: силуэт «сплющенного цилиндра».
// Лицевая и задняя стороны собраны из вертикальных полос, которые вверху сходятся
// к линии запайки (z=0), а книзу расходятся, образуя округлое пузо глубиной
// ±d/2·√(1−u²) — то есть по центру пакет самый пухлый, а по бокам грани смыкаются
// в боковой шов. Дно закрыто эллиптической панелью-гуссетом, верх — тонкой запайкой.
function renderPouch(m) {
  const { w, h, d } = m.size;
  const N = 34; // вертикальных колонок поперёк ширины
  const cap = m.cap || "#1c360e";
  const sw = w / N;
  // Профиль пуза дой-пака по высоте (v: 0 — верхняя запайка, 1 — дно). Узкий
  // запаянный верх (глубина 0) с округлыми плечами → плавное расширение →
  // наполненное «пузо», осевшее в нижнюю треть → выпуклое овальное дно-подставка,
  // на которое пакет устойчиво встаёт. Значение — доля от d/2.
  const prof = [
    [0.0, 0.0], [0.06, 0.40], [0.14, 0.66], [0.26, 0.86],
    [0.42, 0.98], [0.6, 1.0], [0.76, 0.98], [0.9, 0.9], [1.0, 0.78],
  ];
  const baseF = prof[prof.length - 1][1];
  // Колонка постоянной ширины разбита на несколько плоских сегментов по высоте —
  // так кусочно-линейно приближается изогнутый профиль (одна плоская полоса дала
  // бы только линейный скос). Все сегменты — прямые дети .viz3d-obj (единый 3D-
  // контекст), иначе перед и зад в разных preserve-3d не сортируются по глубине.
  // Задняя сторона получается впеканием rotateY(180deg) в трансформ.
  function column(img, i, back) {
    const u = -1 + (2 * (i + 0.5)) / N; // −1..1 поперёк ширины
    const rad = Math.sqrt(Math.max(0, 1 - u * u)); // эллиптический профиль поперёк
    const x = (u * w) / 2;
    const bx = (-i * sw).toFixed(2);
    const pre = back ? "rotateY(180deg) " : "";
    const cls = back ? "viz3d-strip pouch-back" : "viz3d-strip";
    const segs = [];
    for (let k = 1; k < prof.length; k++) {
      const va = prof[k - 1][0];
      const vb = prof[k][0];
      const za = (d / 2) * rad * prof[k - 1][1];
      const zb = (d / 2) * rad * prof[k][1];
      const ya = -h / 2 + va * h;
      const L = Math.hypot(h * (vb - va), zb - za);
      const phi = ((Math.atan2(zb - za, h * (vb - va)) * 180) / Math.PI).toFixed(3);
      const sy = L / (vb - va); // масштаб фрагмента текстуры под длину сегмента
      const py = -va * sy;
      segs.push(
        `            <div class="${cls}" style="width:${(sw + 3).toFixed(2)}px;height:${(L + 2).toFixed(2)}px;margin-left:${(-sw / 2).toFixed(2)}px;transform:${pre}translateX(${x.toFixed(2)}px) translateY(${ya.toFixed(2)}px) translateZ(${za.toFixed(2)}px) rotateX(${phi}deg);background-image:url(${img});background-size:${w}px ${sy.toFixed(2)}px;background-position:${bx}px ${py.toFixed(2)}px;"></div>`
      );
    }
    return segs.join("\n");
  }
  const strips = [];
  for (let i = 0; i < N; i++) strips.push(column(m.faces.back, i, true));
  for (let i = 0; i < N; i++) strips.push(column(m.faces.front, i, false));
  return `          <div class="viz3d-obj viz3d-pouch" style="--cap:${cap};">
            <div class="viz3d-pouch-base" style="width:${w}px;height:${(d * baseF).toFixed(2)}px;margin-left:${(-w / 2).toFixed(2)}px;margin-top:${(-(d * baseF) / 2).toFixed(2)}px;transform:translateY(${(h / 2).toFixed(2)}px) rotateX(90deg);"></div>
${strips.join("\n")}
            <div class="viz3d-pouch-seal" style="width:${w}px;margin-left:${(-w / 2).toFixed(2)}px;transform:translateY(${(-h / 2).toFixed(2)}px);"></div>
          </div>`;
}

// Тип viewer3d — интерактивный CSS-3D дой-пак, который посетитель вращает мышью
// и пальцем (js/pouch-css3d.js). build.js отдаёт только каркас-контейнер с
// текстурами и конфигом в data-*; сами вертикальные полосы-слайсы, боковые швы,
// запайку и овальное донышко геометрически строит JS при инициализации (углы дуги
// и стыковку хорд руками не хардкодим — см. пункт 2 брифа). Без JS и при
// prefers-reduced-motion сцена скрыта и показывается статичный cover (fallback).
function renderViewer3d(m) {
  if (!m) return "";
  const K = m.scale || 1.56; // px на мм — модель занимает ~60% высоты колонки
  const w = +(m.size.w * K).toFixed(1);
  const h = +(m.size.h * K).toFixed(1);
  const bulge = m.bulge != null ? m.bulge : 0.12;
  const slices = m.slices || 14;
  const edge = m.edge || "#1c360e";
  const data = [
    `data-w="${w}"`, `data-h="${h}"`, `data-bulge="${bulge}"`, `data-slices="${slices}"`,
    `data-front="${m.faceFront}"`, `data-back="${m.faceBack || ""}"`,
    `data-left="${m.faceLeft || ""}"`, `data-right="${m.faceRight || ""}"`,
  ].join("\n             ");
  return `\n  <section class="container case-section reveal">
    <div class="case-section-grid">
      <span class="eyebrow">${regmark()} ${m.eyebrow || "Готовый продукт"}</span>
      <figure class="pouch3d">
        <div class="pouch-scene" data-pouch-viewer
             ${data}
             style="--edge:${edge};"></div>
        <img class="pouch-fallback" src="${m.cover}" alt="${m.coverAlt || ""}" loading="lazy" decoding="async">
        <span class="pouch-hint" aria-hidden="true">потяните, чтобы вращать</span>
        <figcaption>${m.caption}</figcaption>
      </figure>
    </div>
  </section>
`;
}

function renderModel3d(m) {
  if (!m) return "";
  const inner =
    m.type === "box"
      ? renderBox(m)
      : m.type === "pouch"
        ? renderPouch(m)
        : renderCylinder(m);
  // Ведущий \n даёт пустую строку-разделитель перед секцией; при пустом model3d
  // возвращается "" и разметка остальных работ не меняется (см. шаблон work.html).
  return `\n  <section class="container case-section reveal">
    <div class="case-section-grid">
      <span class="eyebrow">${regmark()} ${m.eyebrow || "Готовый продукт"}</span>
      <figure class="viz3d viz3d--${m.type}" data-viz3d>
        <div class="viz3d-stage">
${inner}
          <div class="viz3d-gloss" aria-hidden="true"></div>
        </div>
        <span class="viz3d-hint" aria-hidden="true">Потяните, чтобы повернуть</span>
        <figcaption>${m.caption}</figcaption>
      </figure>
    </div>
  </section>
`;
}

function renderWorkPage(work) {
  const categoryWorks = worksByCategory(work.category);
  const idx = categoryWorks.findIndex((w) => w.slug === work.slug);
  const prev = categoryWorks[(idx - 1 + categoryWorks.length) % categoryWorks.length];
  const next = categoryWorks[(idx + 1) % categoryWorks.length];

  const hasGallery = work.gallery && work.gallery.length > 0;
  let html = fill(workTemplate, {
    PAGE_TITLE: work.pageTitle,
    META_DESCRIPTION: work.metaDescription,
    TYPE: work.type,
    CATEGORY_SLUG: work.category,
    TITLE: work.title,
    SUMMARY: work.summary,
    COVER: work.cover,
    COVER_ALT: work.coverAlt,
    COVER_SIZE_ATTR: coverSizeAttr(work.category),
    CLIENT: work.client,
    TASK: work.task,
    ROLE: work.role,
    IDEA_PARAGRAPHS: renderIdeaParagraphs(work.idea),
    IDEA_EXTRAS: renderIdeaExtras(work.idea),
    MODEL_3D: work.viewer3d ? renderViewer3d(work.viewer3d) : renderModel3d(work.model3d),
    VIEWER_SCRIPT: work.viewer3d ? '\n<script src="js/pouch-css3d.js"></script>' : "",
    GALLERY: hasGallery ? renderGallery(work.gallery, work.category) : "",
    OUTCOME: work.outcome,
    PREV_SLUG: prev.slug,
    PREV_TITLE: prev.title,
    NEXT_SLUG: next.slug,
    NEXT_TITLE: next.title,
  });

  if (!hasGallery) {
    html = html.replace(RESULT_SECTION_RE, "");
  }
  return html;
}

function renderDirectionsGrid() {
  const withCounts = categories.map((c) => ({
    ...c,
    count: worksByCategory(c.slug).length,
  }));

  withCounts.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.title.localeCompare(b.title, "ru");
  });

  const panels = withCounts
    .map((c) => {
      const empty = c.count === 0;
      const emptyAttr = empty ? ` data-empty="true"` : "";
      const word = pluralWork(c.count);
      return `      <a class="direction-panel" href="category-${c.slug}.html" data-count="${c.count}"${emptyAttr}>
        <h3 class="direction-title">${c.title}</h3>
        <p class="direction-blurb">${c.blurb}</p>
        <span class="direction-count"><strong>${c.count}</strong> ${word}</span>
      </a>`;
    })
    .join("\n\n");

  return `    <div class="directions-grid">

${panels}

    </div>`;
}

function pluralWork(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "работа";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "работы";
  return "работ";
}

function writeFile(relPath, content) {
  if (!content.endsWith("\n")) content += "\n"; // файлы завершаем переводом строки
  fs.writeFileSync(path.join(ROOT, relPath), content, "utf8");
  console.log(`wrote ${relPath}`);
}

function buildCategories() {
  for (const category of categories) {
    writeFile(`category-${category.slug}.html`, renderCategoryPage(category));
  }
}

function buildWorks() {
  for (const work of works) {
    writeFile(`work-${work.slug}.html`, renderWorkPage(work));
  }
}

function buildIndex() {
  const indexPath = path.join(ROOT, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  const start = "<!-- DIRECTIONS:START -->";
  const end = "<!-- DIRECTIONS:END -->";
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("DIRECTIONS markers not found in index.html");
  }
  const before = html.slice(0, startIdx + start.length);
  const after = html.slice(endIdx);
  const newHtml = `${before}\n${renderDirectionsGrid()}\n    ${after}`;
  fs.writeFileSync(indexPath, newHtml, "utf8");
  console.log("wrote index.html (directions block)");
}

buildCategories();
buildWorks();
buildIndex();