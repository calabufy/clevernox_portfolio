// Данные направлений (категорий). slug/title — из .claude/brif.md, раздел 3.2.
// blurb/metaDescription — дословно из текущей вёрстки index.html / category-*.html
// (уточнено с пользователем; metaDescription не всегда сводится к шаблону
// "{title}: {blurb}." — например у identity текст со связкой "и", а не по шаблону).
const categories = [
  { slug: "identity", title: "Айдентика", blurb: "Логотипы, фирменный стиль, мокапы применения", metaDescription: "Айдентика: логотипы, фирменный стиль и мокапы применения." },
  { slug: "uiux", title: "UI/UX-дизайн", blurb: "Интерфейсы цифровых продуктов", metaDescription: "UI/UX-дизайн: интерфейсы цифровых продуктов." },
  { slug: "ads", title: "Рекламный дизайн", blurb: "Плакаты, баннеры, афиши, листовки, акции, промо", metaDescription: "Рекламный дизайн: плакаты, баннеры, афиши, листовки, акции, промо." },
  { slug: "smm", title: "SMM", blurb: "Посты и визуальный контент для социальных сетей", metaDescription: "SMM: посты и визуальный контент для социальных сетей." },
  { slug: "print", title: "Полиграфия", blurb: "Буклеты, меню, визитки, упаковки", metaDescription: "Полиграфия: буклеты, меню, визитки, упаковки." },
  { slug: "infographics", title: "Инфографика", blurb: "Карточки товаров для Ozon, Wildberries, Яндекс.Маркет", metaDescription: "Инфографика: карточки товаров для Ozon, Wildberries, Яндекс.Маркет." },
  { slug: "motion", title: "Motion Design", blurb: "Анимированные баннеры, анимация логотипов, заставки, короткие видео", metaDescription: "Motion Design: анимированные баннеры, анимация логотипов, заставки, короткие видео." },
];

module.exports = categories;