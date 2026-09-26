// Automatically show one full product at a time, without changing page scrolling.
function initProductSlideshow() {
  const carousel = document.querySelector('.product-slideshow');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const controls = carousel.querySelector('.slideshow-controls');
  const counter = carousel.querySelector('.slide-counter');
  const announcement = carousel.querySelector('.slide-announcement');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = motion.matches;
  let focused = false;
  let timer;
  controls.hidden = false;

  function schedule() {
    clearTimeout(timer);
    if (!paused && !focused && !document.hidden) {
      timer = setTimeout(() => show(index + 1, false), 10000);
    }
  }
  function show(next, manual) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== index;
      slide.classList.toggle('is-entering', i === index);
    });
    counter.textContent = `${index + 1} / ${slides.length}`;
    if (manual) announcement.textContent = slides[index].querySelector('h2').textContent;
    schedule();
  }
  carousel.querySelector('.slide-prev').addEventListener('click', () => show(index - 1, true));
  carousel.querySelector('.slide-next').addEventListener('click', () => show(index + 1, true));
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  document.addEventListener('visibilitychange', schedule);
  function updateMotion() { paused = motion.matches; schedule(); }
  if (motion.addEventListener) motion.addEventListener('change', updateMotion);
  else motion.addListener(updateMotion);
  schedule();
}
