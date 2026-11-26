// Animaciones con Motion (https://motion.dev). Si no carga o el usuario
// prefiere menos movimiento, la página funciona igual, sin animaciones.

const EASE = [0.22, 1, 0.36, 1];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let motion = null;
if (!reduceMotion) {
  try {
    motion = await import("https://cdn.jsdelivr.net/npm/motion@11.18.2/+esm");
  } catch (error) {
    console.warn("Motion no se pudo cargar; la página funciona sin animaciones.", error);
  }
}

const all = (root, selector) => Array.from(root.querySelectorAll(selector));

function play(targets, keyframes, options = {}) {
  if (!motion || targets.length === 0) return Promise.resolve();
  const controls = motion.animate(targets, { ...keyframes }, { ease: EASE, ...options });
  return Promise.resolve(controls.finished ?? controls);
}

function hideFirst(targets) {
  if (motion) targets.forEach((el) => { el.style.opacity = "0"; });
}

const stagger = (step, startDelay = 0) => motion.stagger(step, { startDelay });

/* ---------- Flotación suave (se inicia una sola vez por elemento) ---------- */
const floating = new WeakSet();

function float(targets, amplitude, baseDuration) {
  if (!motion) return;
  targets.forEach((el, i) => {
    if (floating.has(el)) return;
    floating.add(el);
    motion.animate(
      el,
      { y: [0, -amplitude, 0] },
      { duration: baseDuration + i * 1.2, delay: 1 + i * 0.3, repeat: Infinity, ease: "easeInOut" }
    );
  });
}

/* ---------- Entrada propia de cada sección ---------- */
const entrances = {
  // Fade Up + Stagger para el texto, Slide In Right + Scale In para las tarjetas
  home(section) {
    const text = all(section, ".home-text > *");
    const cards = all(section, ".dc-card");
    hideFirst(text);
    hideFirst(cards);
    play(text, { opacity: [0, 1], y: [28, 0] }, { duration: 0.8, delay: stagger(0.12) });
    play(cards, { opacity: [0, 1], x: [70, 0], scale: [0.9, 1] },
      { duration: 0.9, delay: stagger(0.14, 0.25) });
    float(all(section, ".dc-card img"), 10, 6);
  },

  // Fade Up para textos y Scale In escalonado para los botones circulares
  socials(section) {
    const text = all(section, ".display-title, .lead-muted");
    const icons = all(section, ".social-list li");
    hideFirst(text);
    hideFirst(icons);
    play(text, { opacity: [0, 1], y: [28, 0] }, { duration: 0.8, delay: stagger(0.14) });
    play(icons, { opacity: [0, 1], scale: [0.6, 1] },
      { duration: 0.7, delay: stagger(0.12, 0.4) });
  },

  // Slide In Left para la ficha, Slide In Right para la ilustración y fotos que "caen"
  character(section) {
    const text = all(section, ".char-text > *");
    const mary = all(section, ".mary");
    const photos = all(section, ".polaroid");
    hideFirst(text);
    hideFirst(mary);
    hideFirst(photos);
    play(text, { opacity: [0, 1], x: [-40, 0] }, { duration: 0.8, delay: stagger(0.1) });
    play(mary, { opacity: [0, 1], x: [80, 0] }, { duration: 0.9, delay: 0.1 });
    play(photos, { opacity: [0, 1], y: [-30, 0], scale: [1.12, 1] },
      { duration: 0.7, delay: stagger(0.15, 0.55) });
    float(all(section, ".polaroid img"), 5, 5);
  },
};

export function enter(id, section) {
  entrances[id]?.(section);
}

export function exit(section) {
  return play([section], { opacity: [1, 0], y: [0, -14] }, { duration: 0.22, ease: "easeIn" })
    .then(() => {
      section.style.opacity = "";
      section.style.transform = "";
    });
}

/* ---------- Indicador deslizante de la navegación ---------- */
export function movePill(pill, link, instant = false) {
  const x = link.offsetLeft;
  const width = `${link.offsetWidth}px`;
  pill.style.opacity = "1";
  if (!motion) {
    pill.style.transform = `translateX(${x}px)`;
    pill.style.width = width;
    return;
  }
  play([pill], { x, width }, { duration: instant ? 0 : 0.45 });
}

/* ---------- Hover ---------- */
export function enableHover() {
  if (!motion?.hover) return;
  const to = (el, values) => motion.animate(el, values, { duration: 0.3, ease: EASE });

  motion.hover(".dc-hover", (el) => {
    to(el, { scale: 1.05 });
    return () => to(el, { scale: 1 });
  });
  motion.hover(".social-btn", (el) => {
    to(el, { scale: 1.12, y: -3 });
    return () => to(el, { scale: 1, y: 0 });
  });
}
