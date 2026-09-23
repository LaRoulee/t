// WebGL, used sparingly: a slow displacement crossfade for the hero photo sequence.
// The hero falls back to the DOM images when WebGL or a texture is unavailable.
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
