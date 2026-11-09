const textInput = document.querySelector("#specimen-text");
const slider = document.querySelector("#specimen-weight");
const weightValue = document.querySelector("#weight-value");
const preview = document.querySelector("#comparison-preview");
const icon = document.querySelector("#comparison-icon");
const regularIcon = icon.getAttribute("src");
const samples = document.querySelectorAll("[data-sample-text]");
const weights = ["Thin", "Light", "Regular", "Medium", "Semibold", "Bold", "Heavy", "Black"];

function updateSpecimen() {
  const weight = Number(slider.value);
  const style = weights[(weight - 200) / 100];
  weightValue.value = `${style} · ${weight}`;
  slider.setAttribute("aria-valuetext", weightValue.value);
  preview.style.fontWeight = weight;
  icon.src = weight === 400 ? regularIcon : regularIcon.replace("icons/", `icons/${style}/`);
  for (const sample of samples) sample.textContent = textInput.value;
}

const hero = document.querySelector(".hero-specimen");
const heroLine = hero.querySelector(".hero-line");
const context = document.createElement("canvas").getContext("2d");
const rows = document.querySelectorAll(".comparison");

function updateGuides() {
  if (context) {
    const style = getComputedStyle(heroLine);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const baseline = heroLine.querySelector(".baseline-probe").getBoundingClientRect().top
      - hero.getBoundingClientRect().top;
    hero.style.setProperty("--metric-base-y", `${baseline}px`);
    hero.style.setProperty("--metric-cap-y", `${baseline - context.measureText("A").actualBoundingBoxAscent}px`);
    hero.style.setProperty("--metric-x-y", `${baseline - context.measureText("x").actualBoundingBoxAscent}px`);
    hero.classList.add("metrics-ready");
  }
  for (const row of rows) {
    const y = row.querySelector(".baseline-probe").getBoundingClientRect().top - row.getBoundingClientRect().top;
    row.style.setProperty("--baseline-y", `${y}px`);
  }
}

document.querySelector("#specimen-controls").hidden = false;
for (const input of [textInput, slider]) {
  input.addEventListener("input", () => {
    updateSpecimen();
    updateGuides();
  });
}
updateSpecimen();
updateGuides();
window.addEventListener("resize", updateGuides);
document.fonts.ready.then(updateGuides);

const search = document.querySelector("#glyph-search");
const cards = [...document.querySelectorAll(".public-grid .glyph-item")];
const status = document.querySelector("#library-status");

function filterIcons() {
  const words = search.value.toLowerCase().trim().split(/\s+/);
  let count = 0;
  for (const card of cards) {
    const searchable = `${card.dataset.name} ${card.dataset.name.replaceAll(".", " ")} ${card.dataset.code}`.toLowerCase();
    card.hidden = !words.every(word => searchable.includes(word));
    if (!card.hidden) count += 1;
  }
  status.textContent = count ? `${count} ${count === 1 ? "icon" : "icons"}` : "No matching icons.";
}

search.closest("label").hidden = false;
search.addEventListener("input", filterIcons);
filterIcons();

const dialog = document.querySelector("#usage-dialog");
const upstream = document.querySelector("#usage-upstream");
const upstreamLink = document.querySelector("#usage-upstream-link");
const upstreamSource = document.querySelector("#usage-upstream-source");
const download = document.querySelector("#usage-dialog-download");
const attributionSource = document.querySelector("#usage-source");
for (const card of cards) {
  const button = card.querySelector(".glyph-usage");
  button.hidden = false;
  button.addEventListener("click", () => {
    const name = card.id;
    download.href = card.querySelector("img").getAttribute("src");
    download.setAttribute("aria-label", `Download ${name} Regular SVG`);
    attributionSource.href = new URL(`./#${name}`, location.href).href;
    document.querySelector("#usage-dialog-title").textContent = name;
    document.querySelector("#usage-credit-name").textContent = name;
    upstream.hidden = !card.dataset.notice;
    if (card.dataset.notice) {
      upstreamSource.href = card.dataset.upstream;
      upstreamLink.href = `licenses/${card.dataset.notice}`;
      upstreamLink.textContent = card.dataset.notice.startsWith("bootstrap") ? "Bootstrap MIT notice" : "Phosphor MIT notice";
    }
    dialog.showModal();
    dialog.scrollTop = 0;
  });
}
