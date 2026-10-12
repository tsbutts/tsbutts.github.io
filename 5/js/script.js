const DATA_URL = "js/boardingData.json";


async function getData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not load JSON:", error);
    return null;
  }
}


function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}


function setCards(gridId, cards) {
  const cardEls = document.querySelectorAll(`#${gridId} .card`);
  cards.forEach((card, i) => {
    if (!cardEls[i]) return;
    cardEls[i].querySelector("h3").textContent = card.title;
    cardEls[i].querySelector("p").textContent = card.description;
  });
}


function updateText(data) {
  document.title = data.title;
  setText("styleName", data.header);

  setText("heroTitle", data.hero.headline);
  setText("heroDesc", data.hero.description);

  setText("sec1Title", data.sections.overview.title);
  setText("sec1Subtitle", data.sections.overview.subtitle);
  setCards("sec1Grid", data.sections.overview.cards);

  setText("sec2Title", data.sections.equipment.title);
  setText("sec2Subtitle", data.sections.equipment.subtitle);
  setCards("sec2Grid", data.sections.equipment.cards);
}


function updateImage(imagePath) {

  const jsonUrl = new URL(DATA_URL, document.baseURI);
  const fullUrl = new URL(imagePath, jsonUrl).href;

  document
    .getElementById("heroSection")
    .style.setProperty("--hero-img", `url("${fullUrl}")`);
}


async function showSnowboarding() {
  const data = await getData();
  if (!data) return;
  updateText(data);
  updateImage(data.hero.image);
}

document
  .getElementById("changeThemeBtn")
  .addEventListener("click", showSnowboarding);
