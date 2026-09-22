// WebGL, used sparingly: a slow displacement crossfade for the hero sequence, and a light
// ripple / scroll-bend on the contact-sheet frames. Everything falls back to the DOM images
// when WebGL or a texture is unavailable.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      resolve(tex);
    }, undefined, reject);
  });
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const COMMON = /* glsl */ `
  vec2 coverUv(vec2 uv, vec2 box, vec2 img, float zoom) {
    float rb = box.x / box.y;
    float ri = img.x / img.y;
    vec2 s = rb < ri ? vec2(rb / ri, 1.0) : vec2(1.0, ri / rb);
    return (uv - 0.5) * s / zoom + 0.5;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }
`;

const VERT_FULL = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG_HERO = /* glsl */ `
  precision highp float;
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform vec2 uRes;
  uniform vec2 uImgA;
  uniform vec2 uImgB;
  uniform float uProg;
  uniform float uZoomA;
  uniform float uZoomB;
  uniform float uTime;
  uniform float uScroll;
  varying vec2 vUv;
  ${COMMON}
  void main() {
    vec2 uv = vUv;
    float n = fbm(uv * vec2(3.0, 2.2) + uTime * 0.015);
    // an organic wipe that travels like low sun across the field
    float t = n * 0.5 + uv.x * 0.5;
    float edge = uProg * 1.3 - 0.15;
    float mask = smoothstep(t - 0.15, t + 0.15, edge);
    float k = sin(uProg * 3.14159);
    vec2 warp = vec2(n - 0.5, (n - 0.5) * 0.4) * k * 0.035;
    float extra = 1.0 + uScroll * 0.08;
    vec4 a = texture2D(uA, coverUv(uv + warp, uRes, uImgA, uZoomA * extra));
    vec4 b = texture2D(uB, coverUv(uv - warp, uRes, uImgB, uZoomB * extra));
    gl_FragColor = vec4(mix(a.rgb, b.rgb, mask), 1.0);
  }
`;

export class HeroGL {
  constructor(canvas, images, { onChange } = {}) {
    this.canvas = canvas;
    this.images = images;
    this.onChange = onChange;
    this.textures = [];
    this.index = 0;
    this.visible = true;
  }

  async init() {
    const first = await loadTexture(this.images[0].currentSrc || this.images[0].src);
    this.textures[0] = first;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    const size = (t) => new THREE.Vector2(t.image.width, t.image.height);
    this.uniforms = {
      uA: { value: first }, uB: { value: first },
      uImgA: { value: size(first) }, uImgB: { value: size(first) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uProg: { value: 0 }, uZoomA: { value: 1.08 }, uZoomB: { value: 1.08 },
      uTime: { value: 0 }, uScroll: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT_FULL, fragmentShader: FRAG_HERO, uniforms: this.uniforms });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    this.bornA = performance.now();
    this.bornB = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(this.canvas);

    // later slides load in the background
    this.images.slice(1).forEach((img, i) => {
      loadTexture(img.currentSrc || img.src).then((t) => { this.textures[i + 1] = t; }).catch(() => {});
    });
    return this;
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.uniforms.uRes.value.set(w, h);
  }

  // called from the GSAP ticker; returns false if the next slide is not ready yet
  next(gsap) {
    const nextIndex = (this.index + 1) % this.images.length;
    const tex = this.textures[nextIndex];
    if (!tex || this.transitioning) return false;
    const u = this.uniforms;
    u.uB.value = tex;
    u.uImgB.value.set(tex.image.width, tex.image.height);
    this.bornB = performance.now();
    this.transitioning = true;
    gsap.to(u.uProg, {
      value: 1, duration: 2.6, ease: 'power2.inOut',
      onUpdate: () => {
        if (u.uProg.value > 0.5 && this.index !== nextIndex) {
          this.index = nextIndex;
          this.onChange?.(nextIndex);
        }
      },
      onComplete: () => {
        u.uA.value = tex;
        u.uImgA.value.copy(u.uImgB.value);
        this.bornA = this.bornB;
        u.uProg.value = 0;
        this.transitioning = false;
      },
    });
    return true;
  }

  setScroll(p) { if (this.uniforms) this.uniforms.uScroll.value = p; }

  render(time) {
    if (!this.renderer || !this.visible || document.hidden) return;
    const u = this.uniforms;
    const now = performance.now();
    // each photograph drifts out slowly from 1.08 to 1.0 over ~12s
    const drift = (born) => 1.0 + 0.08 * (1 - Math.min((now - born) / 12000, 1));
    u.uZoomA.value = drift(this.bornA);
    u.uZoomB.value = drift(this.bornB || now);
    u.uTime.value = time;
    this.renderer.render(this.scene, this.camera);
  }
}

const VERT_FRAME = /* glsl */ `
  uniform vec2 uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // bow the print with scroll velocity, like paper pulled through the air
    p.x += sin(uv.y * 3.14159) * uBend.x;
    p.y += sin(uv.x * 3.14159) * uBend.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG_FRAME = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uPlane;
  uniform vec2 uImg;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uReveal;
  uniform float uDevelop;
  varying vec2 vUv;
  ${COMMON}
  void main() {
    if (vUv.y > uReveal) discard;
    vec2 uv = vUv;
    vec2 d = uv - uMouse;
    d.x *= uPlane.x / uPlane.y;
    float dist = length(d);
    float fall = smoothstep(0.5, 0.0, dist) * uHover;
    float ripple = sin(dist * 26.0 - uTime * 2.4);
    uv += normalize(d + 1e-5) * ripple * fall * 0.008;
    vec2 cuv = coverUv(uv, uPlane, uImg, 1.0 + uHover * 0.035);
    float split = fall * 0.0035;
    vec3 c = vec3(
      texture2D(uTex, cuv + vec2(split, 0.0)).r,
      texture2D(uTex, cuv).g,
      texture2D(uTex, cuv - vec2(split, 0.0)).b
    );
    // "developing": prints arrive pale and silvery, then gain their colour
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 pale = vec3(l) * 0.55 + 0.42;
    gl_FragColor = vec4(mix(pale, c, uDevelop), 1.0);
  }
`;

export class GalleryGL {
  constructor(items, { axis = 'x' } = {}) {
    this.items = items; // [{ root, figure, img, state: { reveal, develop } }]
    this.axis = axis;
    this.mouse = { x: -9999, y: -9999 };
    this.velocity = 0;
    this.bend = 0;
    this.active = false;
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'gl-overlay';
    this.canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    this.geometry = new THREE.PlaneGeometry(1, 1, 24, 24);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }, { passive: true });

    this.items.forEach((item) => {
      loadTexture(item.img.currentSrc || item.img.src).then((tex) => {
        const uniforms = {
          uTex: { value: tex },
          uPlane: { value: new THREE.Vector2(1, 1) },
          uImg: { value: new THREE.Vector2(tex.image.width, tex.image.height) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 }, uTime: { value: 0 },
          uReveal: { value: item.state.reveal }, uDevelop: { value: item.state.develop },
          uBend: { value: new THREE.Vector2(0, 0) },
        };
        const mesh = new THREE.Mesh(this.geometry, new THREE.ShaderMaterial({ vertexShader: VERT_FRAME, fragmentShader: FRAG_FRAME, uniforms, transparent: true }));
        item.mesh = mesh;
        item.hover = 0;
        this.scene.add(mesh);
        item.root.classList.add('gl-on');
      }).catch(() => {});
    });
    return this;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.vw = w; this.vh = h;
    this.renderer.setSize(w, h, false);
    Object.assign(this.camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
    this.camera.updateProjectionMatrix();
  }

  setVelocity(v) { this.velocity = v; }

  render(time) {
    if (!this.renderer || document.hidden) return;
    this.bend += (THREE.MathUtils.clamp(this.velocity * 0.9, -16, 16) - this.bend) * 0.12;
    let anyVisible = false;

    for (const item of this.items) {
      const { mesh } = item;
      if (!mesh) continue;
      const r = item.figure.getBoundingClientRect();
      const onScreen = r.bottom > -50 && r.top < this.vh + 50 && r.right > -50 && r.left < this.vw + 50;
      mesh.visible = onScreen && item.state.reveal > 0.001;
      if (!mesh.visible) continue;
      anyVisible = true;

      mesh.scale.set(r.width, r.height, 1);
      mesh.position.set(r.left + r.width / 2 - this.vw / 2, this.vh / 2 - r.top - r.height / 2, 0);

      const inside = this.mouse.x >= r.left && this.mouse.x <= r.right && this.mouse.y >= r.top && this.mouse.y <= r.bottom;
      item.hover += ((inside ? 1 : 0) - item.hover) * 0.08;

      const u = mesh.material.uniforms;
      u.uPlane.value.set(r.width, r.height);
      if (inside) u.uMouse.value.set((this.mouse.x - r.left) / r.width, 1 - (this.mouse.y - r.top) / r.height);
      u.uHover.value = item.hover;
      u.uTime.value = time;
      u.uReveal.value = item.state.reveal;
      u.uDevelop.value = item.state.develop;
      u.uBend.value.set(this.axis === 'x' ? -this.bend : 0, this.axis === 'y' ? this.bend : 0);
    }

    if (anyVisible || this.active) this.renderer.render(this.scene, this.camera);
    this.active = anyVisible; // one extra frame clears the canvas after the last print leaves
  }
}
