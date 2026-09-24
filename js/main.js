import { HeroGL, webglAvailable } from './gl.js';

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// WebGL only on larger screens with a fine pointer: phones get the lighter photo crossfade
const canGL = !reduceMotion && webglAvailable() && window.matchMedia('(min-width: 901px) and (pointer: fine)').matches;
document.documentElement.classList.toggle('reduce-motion', reduceMotion);

/* ---------- always open on the first screen ---------- */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

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
  // fallback: a plain crossfade of the DOM photographs (no zoom, so they stay sharp)
  let i = 0;
  if (reduceMotion) return;
  gsap.delayedCall(SLIDE_EVERY, function step() {
    const prev = heroImgs[i];
    i = (i + 1) % heroImgs.length;
    const next = heroImgs[i];
    gsap.set(next, { zIndex: 2 });
    gsap.set(prev, { zIndex: 1 });
    gsap.to(next, { opacity: 1, duration: 2.4, ease: 'power2.inOut', onComplete: () => gsap.set(prev, { opacity: 0 }) });
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

const frames = $$('[data-frame]');

if (!reduceMotion) {
  /* hero intro */
  const heroLines = $$('.hero__title .line > span');
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set('.journey li, .hero__actions > *, .hero__meta', { autoAlpha: 0, y: 12 });
  gsap.timeline({ delay: 0.3 })
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.09, ease: 'expo.out' })
    .to('.journey li', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' }, '-=0.9')
    .to('.hero__actions > *, .hero__meta', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, '-=0.7');

  /* hero out: the photograph stays full size and scrolls away with a slight parallax */
  gsap.timeline({
    scrollTrigger: {
      trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: (st) => heroGL?.setScroll(st.progress),
    },
  })
    .to('.hero__content', { yPercent: -12, autoAlpha: 0, ease: 'power1.in' }, 0)
    .to('.hero__meta', { autoAlpha: 0, ease: 'none' }, 0);

  /* manifesto: words light up as they are read */
  const words = splitWords($('[data-words]'));
  gsap.fromTo(words, { opacity: 0.35 }, {
    opacity: 1, ease: 'none', stagger: 0.05,
    scrollTrigger: { trigger: '.manifesto__text', start: 'top 85%', end: 'bottom 55%', scrub: true },
  });

  // the arrival photo opens from the bottom (no transform on the photo itself, so it stays sharp)
  const arrival = $('[data-manifesto-photo] img');
  const arrivalMask = document.createElement('div');
  arrivalMask.className = 'mask';
  arrival.before(arrivalMask);
  arrivalMask.append(arrival);
  gsap.fromTo(arrivalMask, { clipPath: 'inset(100% 0 0 0)' }, {
    clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.manifesto', start: 'top 70%' },
  });

  // the departure checklist: two boxes already ticked, the last one is the guide
  const items = $$('[data-checklist] .checklist__item');
  gsap.set($$('[data-checklist] .checklist__tick'), { strokeDashoffset: 1 });
  gsap.timeline({ scrollTrigger: { trigger: '[data-checklist]', start: 'top 85%' } })
    .from(items, { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.15, ease: 'expo.out' })
    .to($$('[data-checklist] .checklist__tick'), { strokeDashoffset: 0, duration: 0.5, stagger: 0.2, ease: 'power2.out' }, 0.3);

  /* the contact sheet: every print stays visible; scrolling runs the counter and the marker */
  const counter = $('[data-counter]');
  const steps = $$('[data-steps] li');
  const stepLabel = $('[data-step-label]');
  const marks = frames.map((f) => $('.frame__mark', f));
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
  setStep(0);
  ScrollTrigger.create({
    trigger: '[data-sheet-track]', start: 'top 75%', end: 'bottom 45%',
    onUpdate: (st) => setStep(st.progress),
  });


  /* horizon: the photograph is there from the start and the line arrives */
  gsap.from('[data-horizon-line]', {
    autoAlpha: 0, y: 40, duration: 1.3, ease: 'expo.out',
    scrollTrigger: { trigger: '[data-horizon]', start: 'top 60%' },
  });

  /* services: portrait unveiled */
  const portrait = $('[data-parallax-mask] img');
  const mask = document.createElement('div');
  mask.className = 'mask';
  portrait.before(mask);
  mask.append(portrait);
  gsap.fromTo(mask, { clipPath: 'inset(100% 0 0 0)' }, {
    clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.services', start: 'top 70%' },
  });
  $$('.services__list [data-reveal]').forEach((li) => {
    gsap.from(li.children, {
      y: 22, autoAlpha: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: li, start: 'top 85%' },
    });
  });

  /* CTA: a quiet arrival */
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

/* ---------- checkout: the terms must be accepted before leaving for Payhip ---------- */

const consentForm = $('[data-consent]');
const consentBox = $('#consent');
const checkout = $('[data-checkout]');
const consentError = $('#consent-error');
const syncCheckout = () => {
  checkout.setAttribute('aria-disabled', String(!consentBox.checked));
  if (consentBox.checked) {
    consentError.hidden = true;
    consentForm.classList.remove('is-invalid');
  }
};
consentBox.addEventListener('change', syncCheckout);
consentForm.addEventListener('submit', (e) => e.preventDefault());
checkout.addEventListener('click', (e) => {
  if (consentBox.checked) return;
  e.preventDefault();
  consentError.hidden = false;
  consentForm.classList.add('is-invalid');
  consentBox.focus();
});
syncCheckout();

/* ---------- FAQ accordion: one answer open at a time ---------- */

$$('[data-faq] .faq__q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq__item');
    const open = !item.classList.contains('is-open');
    $$('[data-faq] .faq__item.is-open').forEach((other) => {
      other.classList.remove('is-open');
      $('.faq__q', other).setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
});

/* ---------- mobile buy bar: shown after the hero, hidden once the offer is on screen ---------- */

const buybar = $('[data-buybar]');
let pastHero = false;
let offerInView = false; // true once the offer is on screen or scrolled past
const syncBuybar = () => {
  const on = pastHero && !offerInView;
  buybar.classList.toggle('is-on', on);
  buybar.setAttribute('aria-hidden', String(!on));
  $('a', buybar).tabIndex = on ? 0 : -1;
};
new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; syncBuybar(); }).observe($('[data-hero]'));
new IntersectionObserver(([e]) => { offerInView = e.isIntersecting || e.boundingClientRect.top < 0; syncBuybar(); }, { threshold: 0.15 }).observe($('#acheter'));

window.addEventListener('load', () => {
  // some browsers restore the old position after load: bring the visitor back to the first screen
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
});
