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
