# Pokédex

A lightweight browser-based Pokédex built with plain HTML, CSS, and JavaScript. It fetches Pokémon data from the public PokeAPI and lets you browse, search, and expand the list of Pokémon.

## Features

- Browse the first several Pokémon entries by default
- Click a Pokémon card to open its official Pokédex page
- Search by name or ID
- Load more Pokémon in batches
- Responsive card layout with type-based color styling

## Project Structure

- `main.html` — page structure
- `main.js` — Pokémon fetching, rendering, and search logic
- `main.css` — styling and layout
- `Assets/` — image assets including the Pokéball favicon

## Run locally

Because this project is a static app, you can run it in either of these ways:

### Option 1: Open directly in the browser

Open `main.html` in your browser.

### Option 2: Serve locally

From the project root, run:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## API

This app uses the public PokeAPI:

- https://pokeapi.co/

## Notes

- Internet access is required to fetch Pokémon data.
- The app is intentionally simple and does not require a build step or package installation.
