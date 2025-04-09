const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser();

const fetchWithRetry = async (url, retries = 4, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (err) {
      console.warn(`RSS fetch attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, delay * attempt));
    }
  }
};

(async () => {
  const rssProxy = "https://api.rss2json.com/v1/api.json?rss_url=https://schibelli.dev/rss.xml";
  const feed = await fetchWithRetry(rssProxy);

  const readmePath = "README.md";
  const readme = fs.readFileSync(readmePath, "utf-8");

  const latestPosts = feed.items
    .slice(0, 5)
    .map(item => `- [${item.title}](${item.link})`)
    .join("\n");

  const updatedReadme = readme.replace(
    /## ✍️ Latest Posts on Mindware[\s\S]*?👉 \[More on schibelli\.dev\]\(https:\/\/schibelli\.dev\)/,
    `## ✍️ Latest Posts on Mindware\n\n${latestPosts}\n\n![Mindware Badge](./mindware-badge.svg)\n\n👉 [More on schibelli.dev](https://schibelli.dev)`
  );

  fs.writeFileSync(readmePath, updatedReadme);

  // Generate SVG badge with UTC timestamp
  const timestamp = new Date().toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
  const badgeSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="20">
  <rect width="320" height="20" fill="#555"/>
  <rect x="140" width="180" height="20" fill="#28a745"/>
  <text x="10" y="14" fill="#fff" font-family="Verdana" font-size="11">Mindware Last Updated</text>
  <text x="150" y="14" fill="#fff" font-family="Verdana" font-size="11">${timestamp}</text>
</svg>`;

  fs.writeFileSync("mindware-badge.svg", badgeSVG.trim());
})();
