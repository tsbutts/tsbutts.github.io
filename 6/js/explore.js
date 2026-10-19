"use strict";

const CONFIG = {
  DATA_URL: "js/media.json",
  VIEW_ID: "exploreView",
  STATUS_ID: "exploreStatus"
};

const MESSAGES = {
  LOADING: "Loading categories...",
  LOAD_ERROR: "Sorry, the art media could not be loaded. Check your connection and try again.",
  CATEGORIES_SHOWN: "Showing all categories.",
  RETRY_LABEL: "Try again"
};

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text) {
    element.textContent = options.text;
  }
  Object.entries(options.attributes || {}).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  return element;
}

function createOptionalImage(source, altText) {
  if (!source) {
    return null;
  }
  return createElement("img", {
    attributes: { src: source, alt: altText || "" }
  });
}

function createBackButton(label, onBack) {
  const button = createElement("button", {
    className: "back-btn",
    text: label,
    attributes: { type: "button" }
  });
  button.addEventListener("click", onBack);
  return button;
}

function createChoiceCard(content, onSelect) {
  const item = createElement("li", { className: "choice-card" });
  const button = createElement("button", {
    className: "choice-btn",
    attributes: { type: "button" }
  });

  const image = createOptionalImage(content.image, content.imageAlt);
  if (image) {
    button.appendChild(image);
  }

  const textBox = createElement("div");
  textBox.appendChild(createElement("h3", { text: content.name }));
  textBox.appendChild(createElement("p", { text: content.summary }));
  button.appendChild(textBox);

  button.addEventListener("click", onSelect);
  item.appendChild(button);
  return item;
}

function buildCategoryView(categories, onSelectCategory) {
  const view = createElement("div");
  view.appendChild(createElement("h2", {
    text: "Choose a category",
    attributes: { tabindex: "-1" }
  }));
  view.appendChild(createElement("p", {
    text: "Pick one of the four ways people have expressed themselves. Each category has four media to explore."
  }));

  const list = createElement("ul", { className: "choices" });
  categories.forEach((category) => {
    list.appendChild(createChoiceCard(category, () => onSelectCategory(category)));
  });
  view.appendChild(list);
  return view;
}

function buildMediaView(category, onSelectMedium, onBack) {
  const view = createElement("div");
  view.appendChild(createBackButton("Back to categories", onBack));
  view.appendChild(createElement("h2", {
    text: category.name,
    attributes: { tabindex: "-1" }
  }));
  view.appendChild(createElement("p", { text: "Choose a medium to read about it." }));

  const list = createElement("ul", { className: "choices" });
  category.media.forEach((medium) => {
    const card = createChoiceCard(
      { name: medium.name, summary: medium.description, image: medium.image, imageAlt: medium.imageAlt },
      () => onSelectMedium(medium)
    );
    list.appendChild(card);
  });
  view.appendChild(list);
  return view;
}

function buildDetailView(category, medium, onBack) {
  const view = createElement("article", { className: "detail" });
  view.appendChild(createBackButton(`Back to ${category.name}`, onBack));
  view.appendChild(createElement("h2", {
    text: medium.name,
    attributes: { tabindex: "-1" }
  }));

  const image = createOptionalImage(medium.image, medium.imageAlt);
  if (image) {
    view.appendChild(image);
  }

  view.appendChild(createElement("h3", { text: "What it is" }));
  view.appendChild(createElement("p", { text: medium.description }));
  view.appendChild(createElement("h3", { text: "A bit of history" }));
  view.appendChild(createElement("p", { text: medium.history }));
  return view;
}

function buildErrorView(onRetry) {
  const view = createElement("div", { attributes: { role: "alert" } });
  view.appendChild(createElement("p", { text: MESSAGES.LOAD_ERROR }));
  const retryButton = createElement("button", {
    className: "back-btn",
    text: MESSAGES.RETRY_LABEL,
    attributes: { type: "button" }
  });
  retryButton.addEventListener("click", onRetry);
  view.appendChild(retryButton);
  return view;
}

function showView(view, announcement) {
  const container = document.getElementById(CONFIG.VIEW_ID);
  const status = document.getElementById(CONFIG.STATUS_ID);

  container.replaceChildren(view);
  status.textContent = announcement;

  const heading = view.querySelector("h2");
  if (heading) {
    heading.focus();
  }
}

async function loadMediaData() {
  const response = await fetch(CONFIG.DATA_URL);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

function showCategories(categories) {
  const view = buildCategoryView(categories, (category) => showMedia(categories, category));
  showView(view, MESSAGES.CATEGORIES_SHOWN);
}

function showMedia(categories, category) {
  const view = buildMediaView(
    category,
    (medium) => showDetail(categories, category, medium),
    () => showCategories(categories)
  );
  showView(view, `Showing ${category.name} media.`);
}

function showDetail(categories, category, medium) {
  const view = buildDetailView(category, medium, () => showMedia(categories, category));
  showView(view, `Showing details for ${medium.name}.`);
}

async function startExplore() {
  const container = document.getElementById(CONFIG.VIEW_ID);
  container.replaceChildren(createElement("p", { text: MESSAGES.LOADING }));

  try {
    const data = await loadMediaData();
    showCategories(data.categories);
  } catch (error) {
    showView(buildErrorView(startExplore), MESSAGES.LOAD_ERROR);
  }
}

startExplore();
