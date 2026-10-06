const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
document.querySelectorAll('.drop-menu a').forEach((link) => {
  if (link.textContent.trim() === 'Kids Schedule') link.href = 'kids-schedule.html';
  if (link.textContent.trim() === 'Adult Schedule') link.href = 'adult-classes.html';
  if (link.textContent.trim() === 'Adult Parties') link.href = 'parties.html';
  if (link.textContent.trim() === 'Kids Parties') link.href = 'kids-parties.html';
  if (link.textContent.trim() === 'Project SMASH') link.href = 'project-smash.html';
});
document.querySelectorAll('.main-nav > a').forEach((link) => {
  if (link.textContent.trim() === 'Deals') link.href = 'deals.html';
});
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menu.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
});

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll('.kids-carousel-slide'));
  const controls = carousel.querySelectorAll('[data-carousel-direction]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let autoAdvance;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === current));
  };
  const stopAutoAdvance = () => window.clearInterval(autoAdvance);
  const startAutoAdvance = () => {
    stopAutoAdvance();
    if (!prefersReducedMotion && slides.length > 1) autoAdvance = window.setInterval(() => show(current + 1), 5000);
  };
  controls.forEach((control) => control.addEventListener('click', () => {
    show(current + Number(control.dataset.carouselDirection));
    startAutoAdvance();
  }));
  carousel.addEventListener('mouseenter', stopAutoAdvance);
  carousel.addEventListener('mouseleave', startAutoAdvance);
  carousel.addEventListener('focusin', stopAutoAdvance);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoAdvance();
  });
  startAutoAdvance();
});

const galleryTrack = document.querySelector('.gallery-track');
document.querySelectorAll('[data-gallery-direction]').forEach((control) => {
  control.addEventListener('click', () => {
    const direction = Number(control.dataset.galleryDirection);
    galleryTrack?.scrollBy({ left: direction * galleryTrack.clientWidth * 0.9, behavior: 'smooth' });
  });
});

const lightbox = document.querySelector('#site-lightbox');
const lightboxContent = lightbox?.querySelector('.lightbox-content');
const galleryImages = Array.from(document.querySelectorAll('.gallery-lightbox'));
let activeImageIndex = 0;
let lastLightboxTrigger;

function showLightbox(trigger) {
  if (!lightbox) return;
  lastLightboxTrigger = trigger;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close')?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  lightboxContent?.replaceChildren();
  document.body.style.overflow = '';
  lastLightboxTrigger?.focus();
}

function showGalleryImage(index, trigger) {
  const item = galleryImages[index];
  const sourceImage = item?.querySelector('img');
  if (!lightboxContent || !sourceImage) return;
  activeImageIndex = index;
  lightbox.classList.remove('is-video');
  const image = document.createElement('img');
  image.src = sourceImage.currentSrc || sourceImage.src;
  image.alt = sourceImage.alt;
  lightboxContent.replaceChildren(image);
  showLightbox(trigger || item);
}

function showVideo(videoId, trigger) {
  if (!lightboxContent || !videoId) return;
  lightbox.classList.add('is-video');
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  frame.title = 'SMASH Dance YouTube video';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frame.allowFullscreen = true;
  lightboxContent.replaceChildren(frame);
  showLightbox(trigger);
}

galleryImages.forEach((item, index) => {
  const image = item.querySelector('img');
  item.setAttribute('aria-label', `View ${image?.alt || 'gallery image'} full size`);
  item.addEventListener('click', () => showGalleryImage(index, item));
});

document.querySelectorAll('.video-lightbox').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showVideo(link.dataset.lightboxVideo, link);
  });
});

lightbox?.querySelectorAll('[data-lightbox-close]').forEach((control) => {
  control.addEventListener('click', closeLightbox);
});

lightbox?.querySelector('.lightbox-previous')?.addEventListener('click', () => {
  showGalleryImage((activeImageIndex - 1 + galleryImages.length) % galleryImages.length);
});

lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => {
  showGalleryImage((activeImageIndex + 1) % galleryImages.length);
});

document.addEventListener('keydown', (event) => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (!lightbox.classList.contains('is-video') && event.key === 'ArrowLeft') {
    showGalleryImage((activeImageIndex - 1 + galleryImages.length) % galleryImages.length);
  }
  if (!lightbox.classList.contains('is-video') && event.key === 'ArrowRight') {
    showGalleryImage((activeImageIndex + 1) % galleryImages.length);
  }
});
