const API_URL =
  "https://script.google.com/macros/s/AKfycbxvRs-TgA3tqIMA7tBxvjs5pZ4j52cKyP3gYODzucUM1SU2rQ3OwSNxeqsZDNjRW8gc/exec";

export async function getProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return response.json();
}

export async function getPresets() {
  const response = await fetch(
    `${API_URL}?sheet=Lightroom%20Presets`
  );

  if (!response.ok) {
    throw new Error("Failed to load Lightroom presets");
  }

  return response.json();
}

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