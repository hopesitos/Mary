import { enter, exit, movePill, enableHover } from "./animations.js";

const ids = ["home", "socials", "character"];
const titles = { home: "Home", socials: "Socials", character: "Character" };

const views = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const links = Array.from(document.querySelectorAll("[data-view]"));
const pill = document.getElementById("nav-pill");

let current = null;
let token = 0;

const fromHash = () => {
  const id = window.location.hash.slice(1);
  return ids.includes(id) ? id : "home";
};

function updateNav(id, instant) {
  links.forEach((link) => {
    if (link.dataset.view === id) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const active = links.find((link) => link.dataset.view === id);
  if (active) movePill(pill, active, instant);
}

async function show(id, first = false) {
  if (id === current) return;
  const previous = current;
  const mine = ++token;
  current = id;

  updateNav(id, first);
  document.title = `Mary Schmidt | ${titles[id]}`;

  if (previous) {
    await exit(views[previous]);
    views[previous].hidden = true;
  }
  if (mine !== token) return; // se pidió otra sección mientras salía la anterior

  views[id].hidden = false;
  window.scrollTo(0, 0);
  enter(id, views[id]);

  if (!first) views[id].querySelector(".display-title")?.focus({ preventScroll: true });
}

window.addEventListener("hashchange", () => show(fromHash()));

window.addEventListener("resize", () => {
  const active = links.find((link) => link.dataset.view === current);
  if (active) movePill(pill, active, true);
});

// Mostrar la sección inicial (con la fuente ya lista para medir bien el indicador)
ids.forEach((id) => { views[id].hidden = id !== fromHash(); });
(document.fonts?.ready ?? Promise.resolve()).then(() => {
  show(fromHash(), true);
  enableHover();
});
