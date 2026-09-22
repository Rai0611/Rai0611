/* =========================================================
   MIRISIK — easy customization
   Change the values below. Leave placeholders until you
   have the real details. Do not put API keys or passwords here.
   ========================================================= */
const siteConfig = {
  brideName: "Shameem",
  groomName: "Mohammad Muzammil",
  eventDate: "[DATE]",
  eventTime: "[TIME]",
  location: "[LOCATION]",
  address: "[ADDRESS]",
  mapsLink: "[GOOGLE MAPS LINK]",

  // Replace the hero with your own photo: put a file in assets/images/
  // then set this to "assets/images/hero.jpg" (or leave "" for the gold/maroon background).
  heroImage: "",

  // Google Form embed URLs (the src of the iframe from File > Embed).
  photoFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSdu2BkHuRPqVoXpXjr9AbiMw1kAK5Tp1PWfuvrELRlJP1Wewg/viewform?embedded=true",
  messageFormUrl: "[GOOGLE FORM URL]",

  // Guest messages (Google Sheet). Use the spreadsheet ID from the share link.
  // Best: File → Share → General access: Anyone with the link (Viewer)
  // or File → Share → Publish to web.
  // Columns: Name | Message | Approved (Approved = YES to show; if that
  // column is missing, all messages are shown).
  guestbookSheetId: "1lj6zBf-2ary4zG2v-VWmZexgtJa0IfgGToda8r8tA4k",
  guestbookCsvUrl: "",

  // Published CSV for approved memory uploads from the photo Google Form.
  // Example: https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv
  // The sheet should include a file-upload column and optionally an Approved column.
  memoriesCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQXShl3fwCJUzGkDW7hJOsXHTnS9FDNOpCkPwmd4rFdfPIngGwvs6luZTcaUxfbr4eiLKTufQ5ei8Re/pub?output=csv",

  galleryImages: [
    // Example after you add files:
    // { src: "assets/images/01.jpg", alt: "Family gathering" },
  ],

  links: {
    contact: "https://linktr.ee/Rai0611",
  },
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const CARD_ICONS = ["💌", "🌸", "✨", "💍", "💕"];
let dynamicGalleryImages = [];
let lastImageCount = 0;
let galleryPolling = null;

function isPlaceholder(value) {
  if (!value) return true;
  const text = String(value).trim();
  return text.startsWith("[") && text.endsWith("]");
}

function applyText() {
  const couple = `${siteConfig.groomName} & ${siteConfig.brideName}`;
  document.title = `${couple} — Mirisik`;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${couple} — Mirisik`);

  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (siteConfig[key]) el.textContent = siteConfig[key];
  });

  const maps = document.getElementById("maps-link");
  if (maps) {
    if (isPlaceholder(siteConfig.mapsLink)) {
      maps.setAttribute("aria-disabled", "true");
      maps.addEventListener("click", (event) => {
        event.preventDefault();
      });
    } else {
      maps.href = siteConfig.mapsLink;
    }
  }

  const hero = document.querySelector(".hero");
  const heroBg = document.getElementById("hero-bg");
  if (hero && heroBg && siteConfig.heroImage && !isPlaceholder(siteConfig.heroImage)) {
    hero.classList.add("has-image");
    heroBg.style.backgroundImage = `url("${siteConfig.heroImage}")`;
  }

  setFooterLink("link-contact", siteConfig.links.contact);
}

function setFooterLink(id, href) {
  const el = document.getElementById(id);
  if (!el) return;
  if (isPlaceholder(href)) {
    el.href = "#footer";
    return;
  }
  el.href = href;
  if (href.startsWith("http")) {
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  }
}

function toEmbedUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("usp");
    parsed.searchParams.set("embedded", "true");
    return parsed.toString();
  } catch {
    return url;
  }
}

function renderForm(containerId, url, label) {
  const box = document.getElementById(containerId);
  if (!box) return;

  if (isPlaceholder(url)) {
    box.innerHTML = `<div class="form-placeholder">Paste the ${label} Google Form embed URL in <code>script.js</code> → <code>siteConfig</code>.</div>`;
    return;
  }

  if (url.includes("docs.google.com/forms")) {
    box.innerHTML = `<a class="btn" href="${url}" target="_blank" rel="noopener noreferrer">Open ${label}</a>`;
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = toEmbedUrl(url);
  iframe.title = label;
  iframe.loading = "lazy";
  box.appendChild(iframe);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function approvedMessagesFromCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const header = rows[0].map((item) => item.toLowerCase());
  const nameIndex = header.findIndex((item) => item.includes("name"));
  const messageIndex = header.findIndex((item) => item.includes("message"));
  const approvedIndex = header.findIndex((item) => item.includes("approved"));

  return rows
    .slice(1)
    .map((cols) => ({
      name: cols[nameIndex] || "",
      message: cols[messageIndex] || "",
      approved: (cols[approvedIndex] || "").toUpperCase() === "YES",
    }))
    .filter((item) => item.approved && item.name && item.message);
}

function cardHtml(entry, index) {
  const icon = CARD_ICONS[index % CARD_ICONS.length];
  return `<article class="message-card">
    <p class="message-card__name">${icon} ${escapeHtml(entry.name)}</p>
    <p class="message-card__text">${escapeHtml(entry.message)}</p>
  </article>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMessageWall(messages) {
  const track = document.getElementById("message-track");
  const wall = document.getElementById("message-wall");
  if (!track || !wall) return;

  if (!messages.length) {
    const preview = [
      {
        name: "Guestbook",
        message:
          "Approved messages will appear here after you connect a published Google Sheet CSV in script.js.",
      },
      {
        name: "How it works",
        message:
          "Guests write in the form. You mark Approved as YES in the sheet. Only those notes are shown.",
      },
    ];
    const html = preview.map(cardHtml).join("");
    track.innerHTML = html + html;
    return;
  }

  const html = messages.map(cardHtml).join("");
  track.innerHTML = html + html;
  if (prefersReducedMotion) track.style.animation = "none";
}

async function loadGuestbook() {
  if (isPlaceholder(siteConfig.guestbookCsvUrl)) {
    renderMessageWall([]);
    return;
  }

  try {
    const response = await fetch(siteConfig.guestbookCsvUrl);
    if (!response.ok) throw new Error("Could not load sheet");
    const text = await response.text();
    renderMessageWall(approvedMessagesFromCsv(text));
  } catch (error) {
    renderMessageWall([]);
  }
}

function renderGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const images = [...dynamicGalleryImages, ...siteConfig.galleryImages].filter(
    (item) => item && item.src
  );

  if (!images.length) {
    gallery.innerHTML = ["01", "02", "03", "04"]
      .map(
        (n) =>
          `<div class="gallery__item" aria-hidden="true"><div class="gallery__placeholder">Add photo ${n}</div></div>`
      )
      .join("");
    return;
  }

  gallery.innerHTML = images
    .map(
      (item, index) =>
        `<button class="gallery__item" type="button" data-index="${index}">
          <img src="${item.src}" alt="${escapeHtml(item.alt || "Event photo")}" loading="lazy" />
        </button>`
    )
    .join("");

  gallery.querySelectorAll(".gallery__item").forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(images[Number(button.dataset.index)]);
    });
  });
}

async function loadGalleryFromSheet() {
  if (isPlaceholder(siteConfig.memoriesCsvUrl)) {
    console.log("Memories CSV URL not set");
    dynamicGalleryImages = [];
    renderGallery();
    return;
  }

  try {
    const response = await fetch(siteConfig.memoriesCsvUrl);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const text = await response.text();
    const newImages = galleryImagesFromCsv(text);

    if (newImages.length !== lastImageCount) {
      console.log("Gallery updated:", lastImageCount, "→", newImages.length, "photos");
      lastImageCount = newImages.length;
      dynamicGalleryImages = newImages;
      renderGallery();
    }
  } catch (error) {
    console.error("Error loading memories sheet:", error);
  }
}

function openLightbox(item) {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  if (!lightbox || !image) return;

  image.src = item.src;
  image.alt = item.alt || "";
  if (caption) caption.textContent = item.alt || "";
  lightbox.hidden = false;
  document.getElementById("lightbox-close")?.focus();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  if (!lightbox) return;
  lightbox.hidden = true;
  if (image) image.src = "";
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightbox-close");
  closeBtn?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (!nav || !toggle || !menu) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true }
  );
}

function initReveal() {
  const items = document.querySelectorAll(
    ".section h2, .section .lead, .detail-card, .form-panel, .gallery"
  );
  items.forEach((el) => el.classList.add("reveal"));

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

function initMessageWallTouchPause() {
  const wall = document.getElementById("message-wall");
  const track = document.getElementById("message-track");
  if (!wall || !track) return;

  const pause = () => {
    track.style.animationPlayState = "paused";
  };
  const play = () => {
    if (!prefersReducedMotion) track.style.animationPlayState = "running";
  };

  wall.addEventListener("touchstart", pause, { passive: true });
  wall.addEventListener("touchend", play, { passive: true });
}

function normalizeGoogleDriveUrl(rawUrl) {
  if (!rawUrl) return "";

  const url = String(rawUrl).trim();
  if (!url) return "";

  const openMatch = url.match(/[?&]id=([^&]+)/i);
  const fileMatch = url.match(/\/file\/d\/([^/]+)/i);

  if (openMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  if (fileMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  return url;
}

function galleryImagesFromCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const header = rows[0].map((item) => item.toLowerCase().trim());
  console.log("CSV headers:", header);

  const nameIndex = header.findIndex((item) => item.includes("name"));
  const photoIndex = header.findIndex((item) => /upload|picture|photo|image|file/.test(item));
  const approvedIndex = header.findIndex((item) => item.includes("approved"));

  console.log("Photo column index:", photoIndex, "Header:", header[photoIndex]);

  const images = [];
  rows.slice(1).forEach((cols) => {
    if (!cols[photoIndex]) return;

    const rawUrl = cols[photoIndex].trim();
    const normalizedUrl = normalizeGoogleDriveUrl(rawUrl);
    console.log("Raw URL:", rawUrl, "→", normalizedUrl);

    if (normalizedUrl) {
      images.push({
        src: normalizedUrl,
        alt: "Guest memory",
      });
    }
  });

  console.log("Total images loaded:", images.length);
  return images;
}

applyText();
renderForm("photo-form-embed", siteConfig.photoFormUrl, "photo upload form");
renderForm("message-form-embed", siteConfig.messageFormUrl, "guestbook form");
loadGuestbook();
renderGallery();
initLightbox();
initNav();
initReveal();
initMessageWallTouchPause();
startGalleryPolling();

function startGalleryPolling() {
  if (!isPlaceholder(siteConfig.memoriesCsvUrl)) {
    console.log("Gallery auto-refresh started (every 15 seconds)");
    loadGalleryFromSheet();
    galleryPolling = setInterval(loadGalleryFromSheet, 15000);
  }
}

function stopGalleryPolling() {
  if (galleryPolling) {
    clearInterval(galleryPolling);
    console.log("Gallery auto-refresh stopped");
  }
}
