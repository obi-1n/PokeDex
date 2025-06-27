// --- Configuration ---
const apiData = {
  url: "https://pokeapi.co/api/v2/pokemon/",
  id: 1,
};
const { url, id } = apiData;

const typeColors = {
  bug: "#A6B91A",
  dark: "#705746",
  dragon: "#6F35FC",
  electric: "#F7D02C",
  fairy: "#D685AD",
  fighting: "#C22E28",
  fire: "#EE8130",
  flying: "#A98FF3",
  ghost: "#735797",
  grass: "#7AC74C",
  ground: "#E2BF65",
  ice: "#96D9D6",
  normal: "#A8A77A",
  poison: "#A33EA1",
  psychic: "#F95587",
  rock: "#B6A136",
  steel: "#B7B7CE",
  stellar: "#35ACE7",
  water: "#6390F0",
};

// --- Helper Functions ---
const generateHTML = (data) => {
  const NAME =
    data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();
  const name = data.name;
  const image = data.sprites.front_default;
  const primaryType = data.types[0]?.type.name || "";
  const secondaryType = data.types[1]?.type.name || "";

  const typeColor1 = typeColors[primaryType] || "black";
  const typeColor2 = typeColors[secondaryType] || "none";

  const html = `
    <a href="https://www.pokemon.com/us/pokedex/${name}" target="_blank" style="text-decoration: none; color: inherit;">
      <div class="pokemon" style="border: 8px solid ${typeColor1};">
        <img class="image" src="${image}" alt="${data.name}">
        <div class="container">
          <h3>${NAME}</h3>
          <p style="background-color: ${typeColor1};">${primaryType}</p>
          ${
            secondaryType
              ? `<p style="background-color: ${typeColor2};">${secondaryType}</p>`
              : ""
          }
        </div>
      </div>
    </a>
  `;

  const pokemonDiv = document.querySelector(".pokedex");
  if (pokemonDiv) {
    pokemonDiv.insertAdjacentHTML("beforeend", html);
  }
};

// --- Initial Pokémon Load ---
for (let currentId = id; currentId <= 8; currentId++) {
  const apiURL = `${url}/${currentId}`;
  fetch(apiURL)
    .then((data) => data.json())
    .then((pokemon) => generateHTML(pokemon));
}

// --- Load More Button ---
let currentMaxId = 8;
const loadMoreBtn = document.createElement("button");
loadMoreBtn.id = "load-more-pokemon-btn";
loadMoreBtn.textContent = "Load More Pokémon";
loadMoreBtn.style.display = "block";
loadMoreBtn.style.margin = "24px auto";
loadMoreBtn.style.padding = "12px 24px";
loadMoreBtn.style.fontSize = "1.2em";
document.body.appendChild(loadMoreBtn);

loadMoreBtn.addEventListener("click", () => {
  const nextMaxId = currentMaxId + 8;
  for (let currentId = currentMaxId + 1; currentId <= nextMaxId; currentId++) {
    const apiURL = `${url}/${currentId}`;
    fetch(apiURL)
      .then((data) => data.json())
      .then((pokemon) => generateHTML(pokemon));
  }
  currentMaxId = nextMaxId;
});

// --- Search Input ---
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.id = "pokemon-search";
searchInput.placeholder = "Search by name or ID";

const h1 = document.querySelector("h1");
if (h1 && h1.parentNode) {
  h1.parentNode.insertBefore(searchInput, h1.nextSibling);
}

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    const pokemonDiv = document.querySelector(".pokedex");
    if (pokemonDiv) pokemonDiv.innerHTML = "";
    fetch(`${url}/${query}`)
      .then((data) => {
        if (!data.ok) throw new Error("Not found");
        return data.json();
      })
      .then((pokemon) => generateHTML(pokemon))
      .catch(() => {
        if (pokemonDiv) pokemonDiv.innerHTML = "<p>Pokémon not found.</p>";
      });
  }
});
