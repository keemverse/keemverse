// Still used for Media Kit / Rate Card, and (separately, via
// VERIFY_API_URL in lib/flutterwave.ts, same underlying Apps Script)
// for post-payment verification and download unlocking — don't remove
// this Web App or its URL, only the listing-fetch helpers that used to
// read Fashion Finds/Presets from it are gone now that both pages read
// from the new catalog backend (getCatalogProducts below) instead.
const API_URL =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

export async function getMediaKit() {
  const response = await fetch(`${API_URL}?sheet=Media%20Kit`);

  if (!response.ok) {
    throw new Error("Failed to load media kit stats");
  }

  return response.json();
}

export async function getRateCard() {
  const response = await fetch(`${API_URL}?sheet=Rate%20Card`);

  if (!response.ok) {
    throw new Error("Failed to load rate card");
  }

  return response.json();
}

// Catalog backend (GitHub-file store via /api/products) — Fashion Finds
// and Presets both read from here now. See docs/admin-products-setup.md.
type CatalogType = "fashion_find" | "preset" | "design_bundle";

export async function getCatalogProducts(type: CatalogType) {
  const response = await fetch(`/api/products?type=${type}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${type} products`);
  }

  return response.json();
}