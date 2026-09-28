// Treats a JSON file in this same GitHub repo as the product database.
// No third-party account beyond GitHub/Vercel (both already in use) —
// reads and writes go straight to the GitHub Contents API, so every
// request sees the true current state immediately (never waits on a
// Vercel redeploy, since that API is hit fresh on every call).

const DATA_PATH = "data/products.json";

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name", e.g. "keemverse/keemverse"
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    throw new Error("Missing GITHUB_TOKEN or GITHUB_REPO environment variables");
  }

  return { token, repo, branch };
}

async function githubApi(path: string, init?: RequestInit) {
  const { token } = config();
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function readProducts(): Promise<{ products: any[]; sha: string }> {
  const { repo, branch } = config();
  const file = await githubApi(`/repos/${repo}/contents/${DATA_PATH}?ref=${branch}`);
  const content = Buffer.from(file.content, "base64").toString("utf-8");
  return { products: JSON.parse(content), sha: file.sha };
}

export async function writeProducts(products: any[], sha: string, message: string) {
  const { repo, branch } = config();
  const content = Buffer.from(JSON.stringify(products, null, 2) + "\n", "utf-8").toString("base64");

  await githubApi(`/repos/${repo}/contents/${DATA_PATH}`, {
    method: "PUT",
    body: JSON.stringify({ message, content, sha, branch }),
  });
}

export function isAuthorizedAdmin(req: { headers: Record<string, string | string[] | undefined> }) {
  const provided = req.headers["x-admin-secret"];
  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected) && provided === expected;
}

// Generic versions of readProducts/writeProducts for any JSON file in the
// repo — used by api/pieces.ts to store the Layer Studio piece library
// centrally (GitHub) instead of per-browser IndexedDB, so it's the same on
// every device.
export async function readJsonFile<T>(path: string, fallback: T): Promise<{ data: T; sha: string | null }> {
  const { repo, branch } = config();
  try {
    const file = await githubApi(`/repos/${repo}/contents/${path}?ref=${branch}`);
    const content = Buffer.from(file.content, "base64").toString("utf-8");
    return { data: JSON.parse(content), sha: file.sha };
  } catch (err: any) {
    if (String(err.message).includes("404")) return { data: fallback, sha: null };
    throw err;
  }
}

export async function writeJsonFile(path: string, data: unknown, sha: string | null, message: string) {
  const { repo, branch } = config();
  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n", "utf-8").toString("base64");

  await githubApi(`/repos/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content, sha: sha || undefined, branch }),
  });
}

// Uploads a binary file (e.g. a piece's image) from a base64 data URL.
// Always a fresh path (piece asset filenames are UUID-based), so no sha
// needed — this is a create, never an update.
export async function uploadBinaryFile(path: string, base64Content: string, message: string) {
  const { repo, branch } = config();
  await githubApi(`/repos/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: base64Content, branch }),
  });
  return `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
}

export async function deleteFile(path: string, sha: string, message: string) {
  const { repo, branch } = config();
  await githubApi(`/repos/${repo}/contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch }),
  });
}

export async function getFileSha(path: string): Promise<string | null> {
  const { repo, branch } = config();
  try {
    const file = await githubApi(`/repos/${repo}/contents/${path}?ref=${branch}`);
    return file.sha;
  } catch (err: any) {
    if (String(err.message).includes("404")) return null;
    throw err;
  }
}
