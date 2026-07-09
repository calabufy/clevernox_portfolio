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

function regmark() {
  return `<svg class="regmark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/></svg>`;
}

function renderWorkCard(work) {
  return `      <a class="work-card" href="work-${work.slug}.html">
        <div class="work-card-media">
          <img src="${work.cover}" alt="${work.cardAlt}">
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
  return `  <section class="container reveal" aria-label="${label}" style="padding-bottom: clamp(48px, 6vw, 72px);">
    <div class="work-grid">

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

// Работы категории «Инфографика» приходят в виде карточек 1200×1600 px —
// на странице кейса (обложка + результат) их всегда показываем вполовину
// физического размера. Карточка в сетке направления (work-grid) не уменьшается.
// Ограничиваем через max-width (не width/height-атрибуты): у .result-gallery img
// в CSS нет height:auto, поэтому фиксированный height-атрибут сплющивает картинку —
// max-width сохраняет пропорции без изменения style.css.
const HALF_SIZE_CATEGORIES = ["infographics"];
const NATIVE_WIDTH = 1200;

function caseImageSizeAttr(category) {
  if (!HALF_SIZE_CATEGORIES.includes(category)) return "";
  return ` style="max-width:${NATIVE_WIDTH / 2}px"`;
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

function renderWorkPage(work) {
  const categoryWorks = worksByCategory(work.category);
  const idx = categoryWorks.findIndex((w) => w.slug === work.slug);
  const prev = categoryWorks[(idx - 1 + categoryWorks.length) % categoryWorks.length];
  const next = categoryWorks[(idx + 1) % categoryWorks.length];

  return fill(workTemplate, {
    PAGE_TITLE: work.pageTitle,
    META_DESCRIPTION: work.metaDescription,
    TYPE: work.type,
    CATEGORY_SLUG: work.category,
    TITLE: work.title,
    SUMMARY: work.summary,
    COVER: work.cover,
    COVER_ALT: work.coverAlt,
    COVER_SIZE_ATTR: caseImageSizeAttr(work.category),
    CLIENT: work.client,
    TASK: work.task,
    ROLE: work.role,
    IDEA_PARAGRAPHS: renderIdeaParagraphs(work.idea),
    IDEA_EXTRAS: renderIdeaExtras(work.idea),
    GALLERY: renderGallery(work.gallery, work.category),
    OUTCOME: work.outcome,
    PREV_SLUG: prev.slug,
    PREV_TITLE: prev.title,
    NEXT_SLUG: next.slug,
    NEXT_TITLE: next.title,
  });
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