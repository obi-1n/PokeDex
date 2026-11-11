// --- Configuration ---
const apiData = {
  url: "https://pokeapi.co/api/v2/pokemon/",
  id: 1,
};
const { url } = apiData;

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

const pageSize = 50;
const typeFilterOptions = document.querySelector("#type-filter-options");
const typeFilterSummary = document.querySelector("#type-filter-summary");
const resultsStatus = document.querySelector("#results-status");
const pokemonDiv = document.querySelector(".pokedex");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#pokemon-search");
const typeFilterCache = new Map();
let pokemonList = [];
let currentPage = 1;
let renderVersion = 0;

Object.keys(typeColors).forEach((type) => {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = type;
  checkbox.addEventListener("change", () => {
    currentPage = 1;
    renderPokemon();
  });
  label.append(checkbox, ` ${type.charAt(0).toUpperCase()}${type.slice(1)}`);
  typeFilterOptions?.appendChild(label);
});

document.querySelector("#clear-type-filters")?.addEventListener("click", () => {
  typeFilterOptions?.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
  currentPage = 1;
  renderPokemon();
});

// --- Helper Functions ---

const generateHTML = (data, version = renderVersion) => {
  if (version !== renderVersion) return;

  const displayName =
    data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();
  const name = data.name;
  const imageSources = [
    data.sprites.other?.["official-artwork"]?.front_default,
    data.sprites.front_default,
    "Assets/Poke_Ball.png",
  ].filter((source, index, sources) => source && sources.indexOf(source) === index);
  const primaryType = data.types[0]?.type.name || "";
  const secondaryType = data.types[1]?.type.name || "";

  const typeColor1 = typeColors[primaryType] || "black";
  const typeColor2 = typeColors[secondaryType] || "none";

  const html = `
    <a class="pokemon-link" href="https://www.pokemon.com/us/pokedex/${name}" target="_blank" rel="noopener noreferrer">
      <article class="pokemon">
        <div class="pokemon-artwork" style="--type-color: ${typeColor1};">
          <img class="image" src="${imageSources[0]}" alt="${displayName}" loading="lazy">
        </div>
        <div class="pokemon-info">
          <h3>${displayName}</h3>
          <div class="pokemon-types">
            <span class="type-badge" style="--type-color: ${typeColor1};">${primaryType}</span>
            ${
              secondaryType
                ? `<span class="type-badge" style="--type-color: ${typeColor2};">${secondaryType}</span>`
                : ""
            }
          </div>
        </div>
      </article>
    </a>
  `;

  const pokemonDiv = document.querySelector(".pokedex");
  if (pokemonDiv) {
    pokemonDiv.insertAdjacentHTML("beforeend", html);
    const imageElement = pokemonDiv.lastElementChild?.querySelector(".image");
    let sourceIndex = 0;
    imageElement?.addEventListener("error", () => {
      sourceIndex += 1;
      if (sourceIndex < imageSources.length) {
        imageElement.src = imageSources[sourceIndex];
      }
    });
  }
};

const getSelectedTypes = () =>
  Array.from(
    typeFilterOptions?.querySelectorAll('input[type="checkbox"]:checked') || [],
    (checkbox) => checkbox.value,
  );

const getPokemonNamesForType = async (type) => {
  if (!typeFilterCache.has(type)) {
    const request = fetch(`https://pokeapi.co/api/v2/type/${type}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load the ${type} type.`);
        return response.json();
      })
      .then((data) => new Set(data.pokemon.map(({ pokemon }) => pokemon.name)))
      .catch((error) => {
        typeFilterCache.delete(type);
        throw error;
      });
    typeFilterCache.set(type, request);
  }
  return typeFilterCache.get(type);
};

const renderPagination = (pageCount) => {
  document.querySelectorAll(".pagination").forEach((pagination) => {
    pagination.replaceChildren();
    if (pageCount <= 1) return;

    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = page;
      button.setAttribute("aria-label", `Page ${page}`);
      if (page === currentPage) {
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", () => {
        currentPage = page;
        renderPokemon();
        document.querySelector(".collection-heading")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      pagination.appendChild(button);
    }
  });
};

const renderPokemon = async () => {
  const requestVersion = ++renderVersion;
  const selectedTypes = getSelectedTypes();
  const query = searchInput?.value.trim().toLowerCase() || "";
  if (typeFilterSummary) {
    typeFilterSummary.textContent = selectedTypes.length
      ? `Types (${selectedTypes.length} selected)`
      : "Filter by type";
  }
  if (resultsStatus) resultsStatus.textContent = "Loading Pokémon…";
  if (pokemonDiv) pokemonDiv.replaceChildren();

  try {
    const typeNameSets = await Promise.all(selectedTypes.map(getPokemonNamesForType));
    if (requestVersion !== renderVersion) return;

    const filteredPokemon = pokemonList.filter(({ name, url: pokemonUrl }) => {
      const pokemonId = Number(pokemonUrl.split("/").filter(Boolean).pop());
      const matchesQuery =
        !query || name.includes(query) || String(pokemonId) === query;
      const matchesTypes = typeNameSets.every((names) => names.has(name));
      return matchesQuery && matchesTypes;
    });

    const pageCount = Math.ceil(filteredPokemon.length / pageSize);
    if (pageCount === 0) currentPage = 1;
    else currentPage = Math.min(currentPage, pageCount);

    renderPagination(pageCount);
    const startIndex = (currentPage - 1) * pageSize;
    const pagePokemon = filteredPokemon.slice(startIndex, startIndex + pageSize);

    if (resultsStatus) {
      resultsStatus.textContent = filteredPokemon.length
        ? `Showing ${startIndex + 1}–${startIndex + pagePokemon.length} of ${filteredPokemon.length} Pokémon`
        : "No Pokémon match your search and selected types.";
    }

    const details = await Promise.all(
      pagePokemon.map(async ({ url: pokemonUrl }) => {
        const response = await fetch(pokemonUrl);
        if (!response.ok) throw new Error("Could not load Pokémon details.");
        return response.json();
      }),
    );
    if (requestVersion !== renderVersion) return;
    details.forEach((pokemon) => generateHTML(pokemon, requestVersion));
  } catch (error) {
    if (requestVersion !== renderVersion) return;
    if (resultsStatus) {
      resultsStatus.textContent = "Unable to load Pokémon. Please try again.";
    }
    console.error(error);
  }
};

const loadPokemonList = async () => {
  try {
    const response = await fetch(`${url}?limit=10000`);
    if (!response.ok) throw new Error("Could not load the Pokédex.");
    const data = await response.json();
    pokemonList = data.results;
    renderPokemon();
  } catch (error) {
    if (resultsStatus) {
      resultsStatus.textContent = "Unable to load the Pokédex. Please try again.";
    }
    console.error(error);
  }
};

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  currentPage = 1;
  renderPokemon();
});

loadPokemonList();
