import fs from "fs";
import fetch from "node-fetch";

const readmePath = "README.md";
const badgePath = "mindware-badge.svg";
const username = "johnschibelli";

const query = `
{
  user(username: "${username}") {
    publication {
      posts(page: 0) {
        title
        slug
        brief
        dateAdded
      }
    }
  }
}`;

const fetchWithRetry = async (url, options, retries = 4, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, delay * attempt));
    }
  }
};

const main = async () => {
  const data = await fetchWithRetry("https://gql.hashnode.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const posts = data?.data?.user?.publication?.posts || [];

  const latestPosts = posts.slice(0, 5)
    .map(p => `- [${p.title}](https://${username}.hashnode.dev/${p.slug})`)
    .join("\n");

  const readme = fs.readFileSync(readmePath, "utf-8");

  const updatedReadme = readme.replace(
    /## ✍️ Latest Posts on Mindware[\s\S]*?👉 \[More on schibelli\.dev\]\(https:\/\/schibelli\.dev\)/,
    `## ✍️ Latest Posts on Mindware\n\n${latestPosts}\n\n![Mindware Badge](./mindware-badge.svg)\n\n👉 [More on schibelli.dev](https://schibelli.dev)`
  );

  fs.writeFileSync(readmePath, updatedReadme);

  const timestamp = new Date().toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
  const badgeSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="20">
  <rect width="320" height="20" fill="#555"/>
  <rect x="140" width="180" height="20" fill="#28a745"/>
  <text x="10" y="14" fill="#fff" font-family="Verdana" font-size="11">Mindware Last Updated</text>
  <text x="150" y="14" fill="#fff" font-family="Verdana" font-size="11">${timestamp}</text>
</svg>`;

  fs.writeFileSync(badgePath, badgeSVG.trim());
};

main();
