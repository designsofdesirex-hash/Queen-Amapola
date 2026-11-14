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
  life: [2, 3, 6, 7, 8, 11, 12, 14, 15, 18],
};

const slideshowElements = document.querySelectorAll('[data-slideshow]');
const slideshowState = new Map();
const lifeSlideshowElements = [...document.querySelectorAll('[data-slideshow="life"]')];
let lifeVisibleSlides = [];
let lifeSlideshowVisible = false;
let lifeSlideshowInitialized = false;

function shuffledSlideIndexes(count) {
  const indexes = Array.from({ length: count }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function nextLifeLineup() {
  const available = shuffledSlideIndexes(slideshowPools.life.length)
    .filter((index) => !lifeVisibleSlides.includes(index));
  return available.slice(0, lifeSlideshowElements.length);
}

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
  const initialIndex = pool === 'life' ? undefined : offset;

  if (initialIndex !== undefined) {
    slideshowState.set(element, initialIndex);
    if (element.matches('img')) {
      element.src = slidePath(pool, initialIndex);
    } else {
      element.style.backgroundImage = `url("${slidePath(pool, initialIndex)}")`;
    }
  }
});

function initializeLifeSlideshow() {
  if (lifeSlideshowInitialized) return;
  lifeSlideshowInitialized = true;
  lifeVisibleSlides = shuffledSlideIndexes(slideshowPools.life.length).slice(0, lifeSlideshowElements.length);
  lifeSlideshowElements.forEach((element, index) => {
    const slideIndex = lifeVisibleSlides[index];
    slideshowState.set(element, slideIndex);
    element.style.backgroundImage = `url("${slidePath('life', slideIndex)}")`;
  });
}

const lifeSection = document.querySelector('.lifestyle');
if ('IntersectionObserver' in window && lifeSection) {
  const lifeObserver = new IntersectionObserver(([entry]) => {
    lifeSlideshowVisible = entry.isIntersecting;
    if (lifeSlideshowVisible) initializeLifeSlideshow();
  }, { rootMargin: '240px 0px' });
  lifeObserver.observe(lifeSection);
} else {
  lifeSlideshowVisible = true;
  initializeLifeSlideshow();
}

window.setInterval(() => {
  if (lifeSlideshowVisible) {
    if (!lifeSlideshowInitialized) initializeLifeSlideshow();
    else {
      lifeVisibleSlides = nextLifeLineup();
      lifeSlideshowElements.forEach((element, index) => {
        const nextIndex = lifeVisibleSlides[index];
        slideshowState.set(element, nextIndex);
        setSlide(element, 'life', nextIndex);
      });
    }
  }

  slideshowElements.forEach((element) => {
    const pool = element.dataset.slideshow;
    if (pool === 'life') return;
    const nextIndex = (slideshowState.get(element) + 1) % slideshowPools[pool].length;
    slideshowState.set(element, nextIndex);
    setSlide(element, pool, nextIndex);
  });
}, 6000);

const galleryGrid = document.querySelector('.gallery-grid');
const galleryItems = [...galleryGrid.querySelectorAll('.gallery-item')];
const galleryPrevious = document.querySelector('#gallery-previous');
const galleryNext = document.querySelector('#gallery-next');
const galleryPause = document.querySelector('#gallery-pause');
const galleryPageSize = 8;
const galleryPageCount = Math.ceil(galleryItems.length / galleryPageSize);
const galleryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let galleryPage = 0;
let galleryPacks = [];
let galleryTimer;
let galleryPaused = galleryReducedMotion.matches;
let galleryHoverPaused = false;
let galleryFocusPaused = false;
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

  const finalPack = galleryPacks[galleryPacks.length - 1];
  if (finalPack.length > 0 && finalPack.length < 4) {
    const candidates = shuffled.filter((item) => !finalPack.includes(item));
    finalPack.push(...shuffledGalleryItems(candidates).slice(0, 4 - finalPack.length));
  }
}

function galleryPageItems(page) {
  return galleryPacks[page] || [];
}

function scheduleGallery() {
  window.clearInterval(galleryTimer);
  if (!galleryPaused && !galleryHoverPaused && !galleryFocusPaused && !document.hidden) {
    galleryTimer = window.setInterval(() => showGalleryPage(galleryPage + 1), 7600);
  }
  galleryPause.textContent = galleryPaused ? 'RESUME ROTATION' : 'PAUSE ROTATION';
  galleryPause.setAttribute('aria-pressed', String(galleryPaused));
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
galleryPrevious.addEventListener('click', () => { void showGalleryPage(galleryPage - 1); });
galleryNext.addEventListener('click', () => { void showGalleryPage(galleryPage + 1); });
galleryPause.addEventListener('click', () => {
  galleryPaused = !galleryPaused;
  scheduleGallery();
});
galleryGrid.addEventListener('pointerenter', () => {
  galleryHoverPaused = true;
  scheduleGallery();
});
galleryGrid.addEventListener('pointerleave', () => {
  galleryHoverPaused = false;
  scheduleGallery();
});
galleryGrid.addEventListener('focusin', () => {
  galleryFocusPaused = true;
  scheduleGallery();
});
galleryGrid.addEventListener('focusout', (event) => {
  if (!galleryGrid.contains(event.relatedTarget)) {
    galleryFocusPaused = false;
    scheduleGallery();
  }
});
document.addEventListener('visibilitychange', scheduleGallery);
galleryReducedMotion.addEventListener('change', (event) => {
  if (event.matches) galleryPaused = true;
  scheduleGallery();
});
scheduleGallery();
