import { HeroGL, GalleryGL, webglAvailable } from './gl.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canGL = !reduceMotion && webglAvailable();
document.documentElement.classList.toggle('reduce-motion', reduceMotion);
const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;

/* ---------- smooth scroll with inertia ---------- */

let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#') { e.preventDefault(); return; } // checkout link not connected yet
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
    if (target !== 0) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
});

/* ---------- nav: hides going down, returns going up ---------- */

const nav = $('[data-nav]');
let lastY = 0;
const onScrollNav = (y) => {
  const heroH = $('[data-hero]').offsetHeight;
  nav.classList.toggle('is-solid', y > heroH * 0.6);
  nav.classList.toggle('is-hidden', y > 200 && y > lastY && !nav.contains(document.activeElement));
  lastY = y;
};
if (lenis) lenis.on('scroll', ({ scroll }) => onScrollNav(scroll));
else window.addEventListener('scroll', () => onScrollNav(window.scrollY), { passive: true });

/* ---------- hero: slow photo sequence ---------- */

const heroImgs = $$('[data-hero-stack] img');
const heroIndex = $('[data-hero-index]');
const heroCaption = $('[data-hero-caption]');

const setHeroMeta = (i) => {
  heroIndex.textContent = String(i + 1).padStart(2, '0');
  gsap.fromTo(heroCaption, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' });
  heroCaption.textContent = heroImgs[i].dataset.caption;
};

let heroGL = null;
const SLIDE_EVERY = 7;

function startDomSequence() {
  // fallback: crossfade the DOM photographs with a slow drift
  let i = 0;
  gsap.set(heroImgs, { scale: 1.08 });
  gsap.to(heroImgs[0], { scale: 1, duration: 12, ease: 'none' });
  if (reduceMotion) return;
  gsap.delayedCall(SLIDE_EVERY, function step() {
    const prev = heroImgs[i];
    i = (i + 1) % heroImgs.length;
    const next = heroImgs[i];
    gsap.set(next, { zIndex: 2, scale: 1.08 });
    gsap.set(prev, { zIndex: 1 });
    gsap.to(next, { opacity: 1, duration: 2.4, ease: 'power2.inOut', onComplete: () => gsap.set(prev, { opacity: 0 }) });
    gsap.to(next, { scale: 1, duration: 12, ease: 'none' });
    gsap.delayedCall(1.2, () => setHeroMeta(i));
    gsap.delayedCall(SLIDE_EVERY, step);
  });
}

if (canGL) {
  new HeroGL($('[data-hero-gl]'), heroImgs, { onChange: setHeroMeta }).init().then((gl) => {
    heroGL = gl;
    $('[data-hero]').classList.add('gl-ready');
    gsap.ticker.add((t) => gl.render(t));
    const loop = () => { if (!gl.next(gsap)) gsap.delayedCall(1, loop); else gsap.delayedCall(SLIDE_EVERY, loop); };
    gsap.delayedCall(SLIDE_EVERY, loop);
  }).catch(startDomSequence);
} else {
  startDomSequence();
}

/* ---------- split helpers ---------- */

function splitWords(el) {
  const text = el.textContent;
  el.textContent = '';
  const frag = document.createDocumentFragment();
  text.split(/( +)/).forEach((part) => {
    if (/^ +$/.test(part)) { frag.append(part); return; }
    const w = document.createElement('span');
    w.className = 'w';
    w.textContent = part;
    frag.append(w);
  });
  el.append(frag);
  el.setAttribute('aria-label', text);
  return $$('.w', el);
}

/* ---------- motion ---------- */

const frames = $$('[data-frame]').map((root) => ({
  root,
  figure: $('[data-gl-frame]', root),
  img: $('img', root),
  state: { reveal: 1, develop: 1 },
}));

function applyFrame(f) {
  // DOM mirror of the WebGL reveal, so the effect holds without WebGL too
  f.figure.style.clipPath = `inset(${(1 - f.state.reveal) * 100}% 0 0 0)`;
  if (!f.root.classList.contains('gl-on')) {
    f.img.style.filter = `grayscale(${1 - f.state.develop}) brightness(${1 + (1 - f.state.develop) * 0.35})`;
  }
}

if (!reduceMotion) {
  /* hero intro */
  const heroLines = $$('.hero__title .line > span');
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set('.journey li, .hero__actions > *, .hero__meta', { autoAlpha: 0, y: 12 });
  gsap.timeline({ delay: 0.2 })
    .fromTo('[data-hero-frame]', { clipPath: 'inset(12% 18% 12% 18%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' })
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.09, ease: 'expo.out' }, '-=0.7')
    .to('.journey li', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' }, '-=0.9')
    .to('.hero__actions > *, .hero__meta', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, '-=0.7');

  /* hero out: pinned, the photograph recedes into a print */
  gsap.timeline({
    scrollTrigger: {
      trigger: '[data-hero]', start: 'top top', end: '+=70%', pin: true, scrub: true,
      onUpdate: (st) => heroGL?.setScroll(st.progress),
    },
  })
    .to('[data-hero-frame]', { clipPath: 'inset(9% 7% 9% 7%)', ease: 'none' }, 0)
    .to('.hero__content', { yPercent: -18, autoAlpha: 0, ease: 'power1.in' }, 0)
    .to('.hero__meta', { autoAlpha: 0, ease: 'none' }, 0);

  /* manifesto: words light up as they are read */
  const words = splitWords($('[data-words]'));
  gsap.fromTo(words, { opacity: 0.35 }, {
    opacity: 1, ease: 'none', stagger: 0.05,
    scrollTrigger: { trigger: '.manifesto__text', start: 'top 85%', end: 'bottom 55%', scrub: true },
  });

  /* the contact sheet */
  frames.forEach((f) => { f.state.reveal = 0; f.state.develop = 0; applyFrame(f); });
  const counter = $('[data-counter]');
  const steps = $$('[data-steps] li');
  const revealFrame = (f, extra = {}) => gsap.timeline(extra)
    .to(f.state, { reveal: 1, duration: 1.4, ease: 'expo.inOut', onUpdate: () => applyFrame(f) }, 0)
    .to(f.state, { develop: 1, duration: 2.2, ease: 'power2.out', onUpdate: () => applyFrame(f) }, 0.5);

  // the film counter: scrolling the sheet runs through the 2,303 contacts
  const stepLabel = $('[data-step-label]');
  const marks = frames.map((f) => $('.frame__mark', f.root));
  let marked = -1;
  // the china-marker: a coral loop drawn around the frame being read, as on a real contact sheet
  const markFrame = (i) => {
    if (i === marked) return;
    if (marked >= 0) gsap.to(marks[marked], { strokeDashoffset: -1, duration: 0.5, ease: 'power2.in', overwrite: true, onComplete() { gsap.set(this.targets(), { autoAlpha: 0 }); } });
    marked = i;
    gsap.fromTo(marks[i], { strokeDashoffset: 1, autoAlpha: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', delay: 0.15, overwrite: true });
  };
  const setStep = (p) => {
    counter.textContent = String(Math.round(1 + p * 2302)).padStart(4, '0');
    const active = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
    stepLabel.textContent = steps[active].textContent.trim();
    if (p > 0.001) markFrame(active);
  };

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const track = $('[data-sheet-track]');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    setStep(0);

    const scrollTween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '[data-sheet]', start: 'top top', end: () => '+=' + distance() * 1.1,
        pin: '[data-sheet-pin]', scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: (st) => setStep(st.progress),
      },
    });

    // prints already on the sheet develop together as it arrives; the rest as they slide in
    const inView = frames.filter((f) => f.root.offsetLeft < window.innerWidth * 0.92);
    const later = frames.filter((f) => !inView.includes(f));
    ScrollTrigger.create({
      trigger: '[data-sheet]', start: 'top 55%', once: true,
      onEnter: () => inView.forEach((f, i) => revealFrame(f, { delay: i * 0.14 })),
    });
    later.forEach((f) => {
      ScrollTrigger.create({
        trigger: f.root, containerAnimation: scrollTween, start: 'left 88%', once: true,
        onEnter: () => revealFrame(f),
      });
    });
  });

  mm.add('(max-width: 900px)', () => {
    ScrollTrigger.create({
      trigger: '[data-sheet]', start: 'top 60%', end: 'bottom bottom',
      onUpdate: (st) => setStep(st.progress),
    });
    frames.forEach((f) => {
      ScrollTrigger.create({ trigger: f.root, start: 'top 82%', once: true, onEnter: () => revealFrame(f) });
    });
  });

  /* horizon: the photograph opens from a slit on the horizon line */
  gsap.timeline({
    scrollTrigger: { trigger: '[data-horizon]', start: 'top top', end: '+=140%', pin: '.horizon__pin', scrub: true },
  })
    .fromTo('[data-horizon-img]', { clipPath: 'inset(49.6% 0% 49.6% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.6 }, 0)
    .fromTo('[data-horizon-img] img', { scale: 1.35 }, { scale: 1, ease: 'power2.out', duration: 0.8 }, 0)
    .fromTo('[data-horizon-scrim]', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: 0.3 }, 0.45)
    .fromTo('[data-horizon-line]', { autoAlpha: 0, y: 40, letterSpacing: '0.02em' }, { autoAlpha: 1, y: 0, letterSpacing: '-0.04em', ease: 'expo.out', duration: 0.35 }, 0.5)
    .to({}, { duration: 0.2 });

  /* services: portrait unveiled, then parallax inside its mask */
  const portrait = $('[data-parallax-mask] img');
  const mask = document.createElement('div');
  mask.className = 'mask';
  portrait.before(mask);
  mask.append(portrait);
  gsap.fromTo(mask, { clipPath: 'inset(100% 0 0 0)' }, {
    clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.services', start: 'top 70%' },
  });
  gsap.fromTo(portrait, { scale: 1.22, yPercent: -7 }, {
    yPercent: 7, ease: 'none',
    scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  $$('.services__list [data-reveal]').forEach((li) => {
    gsap.from(li.children, {
      y: 22, autoAlpha: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: li, start: 'top 85%' },
    });
  });

  /* CTA: parallax and a quiet arrival */
  gsap.fromTo('[data-cta-img]', { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '[data-cta]', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  const ctaLines = $$('.cta__title .line > span');
  gsap.from(ctaLines, {
    yPercent: 110, duration: 1.3, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.cta__panel', start: 'top 80%' },
  });
  gsap.from('.offer > *', {
    autoAlpha: 0, y: 18, duration: 1, stagger: 0.08, ease: 'expo.out',
    scrollTrigger: { trigger: '.cta__panel', start: 'top 75%' },
  });

}

/* ---------- calendar: hover tooltip and a month-by-month sweep ---------- */

const heat = $('[data-heat]');
const tip = $('[data-heat-tip]');
heat.addEventListener('pointerover', (e) => {
  const td = e.target.closest('td[data-tip]');
  if (!td) return;
  tip.innerHTML = td.dataset.tip;
  tip.classList.add('is-on');
});
heat.addEventListener('pointermove', (e) => { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; });
heat.addEventListener('pointerleave', () => tip.classList.remove('is-on'));

if (!reduceMotion) {
  // the year sweeps across the table, January to December, like a season arriving
  const cols = [...Array(12).keys()].map((m) => $$(`tbody tr td:nth-of-type(${m + 1})`, heat));
  const target = new Map(cols.flat().map((td) => [td, parseFloat(td.style.getPropertyValue('--v'))]));
  gsap.set(cols.flat(), { '--v': 0 });
  ScrollTrigger.create({
    trigger: heat, start: 'top 75%', once: true,
    onEnter: () => cols.forEach((col, m) => {
      col.forEach((td) => {
        gsap.to(td, { '--v': target.get(td), duration: 0.9, delay: m * 0.07, ease: 'power2.out' });
      });
    }),
  });
}

/* ---------- WebGL frames ---------- */

if (canGL) {
  const gallery = new GalleryGL(frames, { axis: isDesktop() ? 'x' : 'y' }).init();
  gsap.ticker.add((t) => {
    gallery.axis = isDesktop() ? 'x' : 'y';
    gallery.setVelocity(lenis ? lenis.velocity : 0);
    gallery.render(t);
  });
}

window.addEventListener('load', () => ScrollTrigger.refresh());
