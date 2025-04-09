const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser();

const fetchWithRetry = async (url, retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await parser.parseURL(url);
    } catch (err) {
      console.log(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

(async () => {
  const feedUrl = "https://schibelli.dev/rss.xml";
  const feed = await fetchWithRetry(feedUrl);

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

  // Generate badge with timestamp
  const timestamp = new Date().toISOString().split("T").join(" ").replace(/\.\d+Z$/, " UTC");
  const badgeSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="20">
  <rect width="300" height="20" fill="#555"/>
  <rect x="130" width="170" height="20" fill="#28a745"/>
  <text x="10" y="14" fill="#fff" font-family="Verdana" font-size="11">Mindware Last Updated</text>
  <text x="140" y="14" fill="#fff" font-family="Verdana" font-size="11">${timestamp}</text>
</svg>`;

  fs.writeFileSync("mindware-badge.svg", badgeSVG.trim());
})();
