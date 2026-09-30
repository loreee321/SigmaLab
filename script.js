/* =====================================================================
   SigmaLab · script.js
   In cima trovi le due cose che cambi più spesso:
     1. CONFIG   → nome, link, email, colori
     2. PRODUCTS → i prodotti di "I nostri lavori"
   Il resto è il codice che fa funzionare il sito (non serve toccarlo).
   ===================================================================== */

/* ---------- 1. CONFIG ---------- */
const CONFIG = {
  brandName: "SigmaLab",

  // Link completi, che iniziano con https://
  tiktokShopUrl: "[INSERIRE QUI LINK TIKTOK SHOP]",
  tiktokUrl: "[INSERIRE QUI LINK TIKTOK]",
  instagramUrl: "[INSERIRE QUI LINK INSTAGRAM]",
  email: "[INSERIRE QUI EMAIL]", // es. "ciao@tuodominio.it"

  // Dove porta il pulsante "Contattaci": "instagram", "tiktok" oppure "email"
  contactChannel: "instagram",

  // false = i link non compilati restano visibili e mostrano un avviso
  // true  = i link non compilati spariscono (mettilo a true quando pubblichi)
  hideUnsetLinks: false,

  // Blu = struttura del sito, arancione = pulsanti verso il TikTok Shop
  colors: {
    blue: "#2F6BFF",
    blueSoft: "#7BA2FF",
    orange: "#FF6A1A",
  },
};

/* ---------- 2. PRODUCTS ----------
   Aggiungere un prodotto: copia un blocco { ... }, incollalo in fondo (con la virgola) e cambia i valori.
   Togliere un prodotto: cancella il suo blocco.
   image → foto quadrata in assets/products/
   link  → (facoltativo) link al prodotto su TikTok Shop; se vuoto va al TikTok Shop generale */
const PRODUCTS = [
  {
    name: "Barboncino",
    image: "assets/products/prodotto-01.jpg",
    description: "Cagnolino dal pelo riccio, ricco di dettagli.",
    link: "",
  },
  {
    name: "Gatto nero",
    image: "assets/products/prodotto-02.jpg",
    description: "Elegante scultura di gatto, perfetta per scrivania e libreria.",
    link: "",
  },
  {
    name: "Gioielli con iniziale",
    image: "assets/products/prodotto-03.jpg",
    description: "Ciondoli e orecchini a tema coccinella, con l'iniziale che preferisci.",
    link: "",
  },
];

/* Testi mostrati dallo script */
const TEXT = {
  viewOnShop: "Vedi su TikTok Shop",
  unsetLink: "Questo link non è ancora configurato. Modificalo in CONFIG dentro script.js.",
  menuOpen: "Apri il menu",
  menuClose: "Chiudi il menu",
};

/* =====================================================================
   CODICE DEL SITO (non serve modificarlo)
   ===================================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v.trim());
  const isEmail = (v) => typeof v === "string" && /^[^\s@\[\]]+@[^\s@\[\]]+\.[^\s@\[\]]+$/.test(v.trim());
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Nome del brand e colori dal CONFIG */
  function applyBrandAndColors() {
    $$("[data-brand]").forEach((el) => (el.textContent = CONFIG.brandName));
    const root = document.documentElement.style;
    root.setProperty("--blue", CONFIG.colors.blue);
    root.setProperty("--blue-soft", CONFIG.colors.blueSoft);
    root.setProperty("--orange", CONFIG.colors.orange);
  }

  /* Link: ogni <a data-link="..."> prende l'indirizzo dal CONFIG */
  function getLinks() {
    const links = {
      tiktokShop: isUrl(CONFIG.tiktokShopUrl) ? CONFIG.tiktokShopUrl.trim() : "",
      tiktok: isUrl(CONFIG.tiktokUrl) ? CONFIG.tiktokUrl.trim() : "",
      instagram: isUrl(CONFIG.instagramUrl) ? CONFIG.instagramUrl.trim() : "",
      email: isEmail(CONFIG.email) ? `mailto:${CONFIG.email.trim()}` : "",
    };
    links.contact = links[CONFIG.contactChannel] || "";
    return links;
  }

  function setLink(a, url) {
    if (url) {
      a.href = url;
      if (/^https?:/i.test(url)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    } else if (CONFIG.hideUnsetLinks) {
      (a.closest("li") || a).hidden = true;
    } else {
      a.setAttribute("href", "#");
      a.setAttribute("data-unset", "");
    }
  }

  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3500);
  }

  function applyLinks() {
    const links = getLinks();
    $$("[data-link]").forEach((a) => setLink(a, links[a.dataset.link]));
    // Click su un link non configurato: mostra un avviso
    document.addEventListener("click", (e) => {
      if (!e.target.closest("a[data-unset]")) return;
      e.preventDefault();
      showToast(TEXT.unsetLink);
    });
    return links;
  }

  /* Se una foto manca, resta visibile il riquadro segnaposto */
  function watchImage(img) {
    const hide = () => (img.hidden = true);
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) hide();
  }

  /* Menu di navigazione (mobile) + evidenziazione della sezione visibile */
  function initNav() {
    const header = $(".site-header");
    const toggle = $(".menu-toggle");
    const nav = $("#site-nav");

    const setOpen = (open) => {
      header.classList.toggle("menu-open", open);
      document.body.classList.toggle("no-scroll", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? TEXT.menuClose : TEXT.menuOpen);
    };
    const isOpen = () => header.classList.contains("menu-open");

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) setOpen(false); });
    document.addEventListener("click", (e) => { if (isOpen() && !header.contains(e.target)) setOpen(false); });
    window.matchMedia("(min-width: 1041px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });

    // Sfondo sfocato dopo un po' di scroll
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Voce di menu attiva
    if ("IntersectionObserver" in window) {
      const links = $$(".nav-list a");
      const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
          const active = byId.get(entry.target.id);
          if (active) { active.classList.add("is-active"); active.setAttribute("aria-current", "true"); }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("main section[id]").forEach((s) => spy.observe(s));
    }
  }

  /* Le sezioni compaiono con una piccola animazione mentre scorri */
  function initReveal() {
    const items = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* "I nostri lavori": una card per ogni prodotto di PRODUCTS */
  const CUBE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>';
  const ARROW_SVG = '<svg class="icon-ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  function createCard(product, index, links) {
    const li = document.createElement("li");
    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--i", index);

    // Foto (con il segnaposto sotto, se il file manca)
    const media = document.createElement("div");
    media.className = "card-media";
    media.innerHTML = `<div class="ph" aria-hidden="true">${CUBE_SVG}<span>Foto prodotto</span></div>`;
    const img = document.createElement("img");
    img.width = 1000;
    img.height = 1000;
    img.loading = "lazy";
    img.alt = product.name;
    watchImage(img);
    img.src = product.image;
    media.appendChild(img);

    // Testi
    const body = document.createElement("div");
    body.className = "card-body";
    const title = document.createElement("h3");
    title.textContent = product.name;
    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = product.description;
    body.append(title, desc);

    // Pulsante: link del prodotto oppure TikTok Shop generale
    const url = isUrl(product.link) ? product.link.trim() : links.tiktokShop;
    if (url || !CONFIG.hideUnsetLinks) {
      const a = document.createElement("a");
      a.className = "btn btn-ghost btn-sm";
      a.innerHTML = `<span>${TEXT.viewOnShop}</span>${ARROW_SVG}`;
      setLink(a, url);
      body.appendChild(a);
    }

    card.append(media, body);
    li.appendChild(card);
    return li;
  }

  function renderProducts(links) {
    const grid = $("#product-grid");
    PRODUCTS.forEach((p, i) => grid.appendChild(createCard(p, i, links)));
  }

  /* Avvio */
  function init() {
    applyBrandAndColors();
    const links = applyLinks();
    $$("img[data-fallback]").forEach(watchImage);
    initNav();
    renderProducts(links);
    initReveal();
    $("#year").textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
