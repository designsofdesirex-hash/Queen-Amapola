document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.dataset.lastAction = link.getAttribute('href');
  });
});

const ageGate = document.querySelector('#age-gate');
const site = document.querySelector('.site-shell');
const ageEnter = document.querySelector('#age-enter');
const ageKey = 'queen-amapola-adult-confirmed';

try {
  if (sessionStorage.getItem(ageKey) === 'yes') {
    ageGate.hidden = true;
    site.inert = false;
  } else {
    ageEnter.focus();
  }
} catch {
  ageEnter.focus();
}

const ageGateCollage = document.querySelector('.age-gate-collage');
const ageGateSlides = [1, 5, 6, 13, 16, 18].map((index) => `assets/photos/amapola/${String(index).padStart(2, '0')}.webp`);
const ageGateMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let ageGateIndex = 0;
let ageGateRotation;
let ageGateFadeTimeout;

function preloadAgeGateSlide(index) {
  const image = new Image();
  image.decoding = 'async';
  image.src = ageGateSlides[index];
}

function stopAgeGateRotation() {
  window.clearInterval(ageGateRotation);
  window.clearTimeout(ageGateFadeTimeout);
  ageGateCollage.classList.remove('is-fading');
  ageGateRotation = undefined;
}

function startAgeGateRotation() {
  if (ageGateRotation || ageGate.hidden || ageGateMotion.matches || ageGateSlides.length < 2) return;

  preloadAgeGateSlide((ageGateIndex + 1) % ageGateSlides.length);
  ageGateRotation = window.setInterval(() => {
    const nextIndex = (ageGateIndex + 1) % ageGateSlides.length;
    ageGateCollage.classList.add('is-fading');
    ageGateFadeTimeout = window.setTimeout(() => {
      ageGateCollage.style.backgroundImage = `url("${ageGateSlides[nextIndex]}")`;
      ageGateIndex = nextIndex;
      ageGateCollage.classList.remove('is-fading');
      preloadAgeGateSlide((ageGateIndex + 1) % ageGateSlides.length);
    }, 950);
  }, 6800);
}

if (ageGateCollage && ageGateSlides.length) {
  startAgeGateRotation();
  ageGateMotion.addEventListener('change', (event) => {
    if (event.matches) stopAgeGateRotation();
    else startAgeGateRotation();
  });
}

ageEnter.addEventListener('click', () => {
  stopAgeGateRotation();
  try {
    sessionStorage.setItem(ageKey, 'yes');
  } catch {
    // The confirmation still works when browser storage is unavailable.
  }
  ageGate.hidden = true;
  site.inert = false;
});

const slideshowPools = {
  landing: [5, 1, 16, 6, 18, 13, 3],
};

const slideshowElements = document.querySelectorAll('[data-slideshow]');
const slideshowState = new Map();

function slidePath(pool, index) {
  return `assets/photos/amapola/${String(slideshowPools[pool][index % slideshowPools[pool].length]).padStart(2, '0')}.webp`;
}

function setSlide(element, pool, index) {
  const nextPath = slidePath(pool, index % slideshowPools[pool].length);
  const commit = () => {
    element.classList.add('is-slideshow-fading');
    window.setTimeout(() => {
      if (element.matches('img')) {
        element.src = nextPath;
      } else {
        element.style.backgroundImage = `url("${nextPath}")`;
      }
      element.classList.remove('is-slideshow-fading');
    }, 220);
  };

  const preload = new Image();
  preload.onload = commit;
  preload.onerror = () => element.classList.remove('is-slideshow-fading');
  preload.src = nextPath;
}

slideshowElements.forEach((element) => {
  const pool = element.dataset.slideshow;
  const offset = Number(element.dataset.slideOffset || 0);
  slideshowState.set(element, offset);
  if (element.matches('img')) {
    element.src = slidePath(pool, offset);
  } else {
    element.style.backgroundImage = `url("${slidePath(pool, offset)}")`;
  }
});

window.setInterval(() => {
  slideshowElements.forEach((element) => {
    const pool = element.dataset.slideshow;
    const nextIndex = (slideshowState.get(element) + 1) % slideshowPools[pool].length;
    slideshowState.set(element, nextIndex);
    setSlide(element, pool, nextIndex);
  });
}, 6000);

const galleryGrid = document.querySelector('.gallery-grid');
const galleryItems = [...galleryGrid.querySelectorAll('.gallery-item')];
const galleryTargetPageSize = galleryItems.length / 4;
const galleryPageSize = Array.from({ length: Math.floor(galleryItems.length / 2) }, (_, index) => (index + 1) * 2)
  .filter((size) => galleryItems.length % size === 0)
  .sort((first, second) => Math.abs(first - galleryTargetPageSize) - Math.abs(second - galleryTargetPageSize) || second - first)[0]
  || Math.max(2, Math.ceil(galleryTargetPageSize / 2) * 2);
const galleryPageCount = Math.ceil(galleryItems.length / galleryPageSize);
let galleryPage = 0;
let galleryPacks = [];
let galleryTimer;
let galleryChange = 0;

function shuffledGalleryItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffleGalleryPacks() {
  const shuffled = shuffledGalleryItems(galleryItems);
  galleryPacks = Array.from({ length: galleryPageCount }, (_, index) =>
    shuffled.slice(index * galleryPageSize, (index + 1) * galleryPageSize));

}

function galleryPageItems(page) {
  return galleryPacks[page] || [];
}

function scheduleGallery() {
  window.clearInterval(galleryTimer);
  if (!document.hidden) {
    galleryTimer = window.setInterval(() => showGalleryPage(galleryPage + 1), 7600);
  }
}

async function showGalleryPage(nextPage) {
  const token = ++galleryChange;
  if (nextPage >= galleryPageCount && galleryPage === galleryPageCount - 1) {
    shuffleGalleryPacks();
  }
  const page = (nextPage + galleryPageCount) % galleryPageCount;
  const pageItems = galleryPageItems(page);
  const images = pageItems.map((item) => item.querySelector('img'));
  images.forEach((image) => { image.loading = 'eager'; });
  await Promise.all(images.map((image) => image.decode().catch(() => {})));
  if (token !== galleryChange) return;

  galleryGrid.classList.add('is-changing');
  await new Promise((resolve) => window.setTimeout(resolve, 220));
  if (token !== galleryChange) return;
  galleryPage = page;
  const visibleItems = new Set(pageItems);
  galleryItems.forEach((item) => { item.hidden = !visibleItems.has(item); });
  galleryGrid.classList.remove('is-changing');
}

shuffleGalleryPacks();
const firstPack = new Set(galleryPageItems(0));
galleryItems.forEach((item) => { item.hidden = !firstPack.has(item); });
galleryGrid.dataset.ready = 'true';
document.addEventListener('visibilitychange', scheduleGallery);
scheduleGallery();
