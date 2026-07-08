/* ---------- Config ---------- */
var GALLERIES = {
  B:  { title: "Gabi & Martín",     count: 11, cover: 5 },
  C:  { title: "Yele & Matt",       count: 12, cover: 6 },
  D:  { title: "Techi & Eze",       count: 19, cover: 10 },
  E:  { title: "Carol & Richard",   count: 20, cover: 15 },
  G1: { title: "Lauri y Nahum",     count: 43, cover: 20 },
  G2: { title: "Pati y Ricard",     count: 18, cover: 9 },
  H:  { title: "Pamela y Dennis",   count: 14, cover: 7 },
  I:  { title: "Salmy y Victor",    count: 12, cover: 3 }
};

var WHATSAPP_NUMBER = "595994202592";
var CONTACT_EMAIL = "favila1696@gmail.com";

document.addEventListener("DOMContentLoaded", function () {
  buildGalleryCards();
  initLightbox();
  initContactMenus();
  initLangSwitch();
  initContactForm();
});

/* ---------- Gallery cards ---------- */
function buildGalleryCards() {
  var grid = document.querySelector(".gallery-grid");
  if (!grid) return;
  var viewLabel = grid.getAttribute("data-view-label") || "View gallery";
  var photosLabel = grid.getAttribute("data-photos-label") || "photos";
  Object.keys(GALLERIES).forEach(function (id) {
    var g = GALLERIES[id];
    var card = document.createElement("div");
    card.className = "gallery-card";
    card.setAttribute("data-gallery", id);
    card.innerHTML =
      '<img src="/gallery/wedding-' + id + '-' + g.cover + '.jpg" loading="lazy" alt="' + g.title + '">' +
      '<div class="overlay"><h3>' + g.title + '</h3><span>' + g.count + ' ' + photosLabel + ' &middot; ' + viewLabel + '</span></div>';
    grid.appendChild(card);
  });
}

/* ---------- Lightbox ---------- */
function initLightbox() {
  var lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  var stageImg = lightbox.querySelector(".lightbox-stage img");
  var titleEl = lightbox.querySelector(".lb-title");
  var countEl = lightbox.querySelector(".lb-count");
  var closeBtn = lightbox.querySelector(".lightbox-close");
  var prevBtn = lightbox.querySelector(".lightbox-prev");
  var nextBtn = lightbox.querySelector(".lightbox-next");

  var currentGallery = null;
  var currentIndex = 0;

  function open(id, index) {
    currentGallery = id;
    currentIndex = index;
    render();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  function render() {
    var g = GALLERIES[currentGallery];
    stageImg.src = "/gallery/wedding-" + currentGallery + "-" + (currentIndex + 1) + ".jpg";
    stageImg.alt = g.title + " " + (currentIndex + 1);
    titleEl.textContent = g.title;
    countEl.textContent = (currentIndex + 1) + " / " + g.count;
  }
  function next() {
    var g = GALLERIES[currentGallery];
    currentIndex = (currentIndex + 1) % g.count;
    render();
  }
  function prev() {
    var g = GALLERIES[currentGallery];
    currentIndex = (currentIndex - 1 + g.count) % g.count;
    render();
  }

  document.addEventListener("click", function (e) {
    var card = e.target.closest(".gallery-card");
    if (card) open(card.getAttribute("data-gallery"), 0);
  });
  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
}

/* ---------- Contact menu popups ---------- */
function initContactMenus() {
  var triggers = document.querySelectorAll(".contact-trigger");
  triggers.forEach(function (trigger) {
    var wrap = trigger.closest(".contact-trigger-wrap");
    var menu = wrap ? wrap.querySelector(".contact-menu-popup") : null;
    if (!menu) return;

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = menu.classList.contains("open");
      document.querySelectorAll(".contact-menu-popup.open").forEach(function (m) { m.classList.remove("open"); });
      if (!isOpen) menu.classList.add("open");
    });

    var formLink = menu.querySelector('[data-action="form"]');
    if (formLink) {
      formLink.addEventListener("click", function (e) {
        e.preventDefault();
        menu.classList.remove("open");
        var panel = document.querySelector(".contact-form-panel");
        if (panel) {
          panel.classList.add("open");
          panel.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".contact-menu-popup.open").forEach(function (m) { m.classList.remove("open"); });
  });
}

/* ---------- Language switch dropdown ---------- */
function initLangSwitch() {
  var switchEl = document.querySelector(".lang-switch");
  if (!switchEl) return;
  var trigger = switchEl.querySelector(".lang-current");
  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    switchEl.classList.toggle("open");
  });
  document.addEventListener("click", function () {
    switchEl.classList.remove("open");
  });
}

/* ---------- Contact form submit ---------- */
function initContactForm() {
  var form = document.querySelector(".contact-form-panel form");
  if (!form) return;
  var statusEl = form.querySelector(".form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      name: form.name.value,
      email: form.email.value,
      eventDate: form.eventDate ? form.eventDate.value : "",
      message: form.message.value,
      lang: document.documentElement.lang
    };
    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    statusEl.textContent = "";
    statusEl.className = "form-status";

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then(function () {
        statusEl.textContent = form.getAttribute("data-msg-ok") || "Message sent.";
        statusEl.className = "form-status ok";
        form.reset();
      })
      .catch(function () {
        statusEl.textContent = form.getAttribute("data-msg-err") || "Something went wrong. Please try WhatsApp or email instead.";
        statusEl.className = "form-status err";
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
}
