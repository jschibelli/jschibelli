const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser();
const badgePath = "mindware-badge.svg";

async function fetchFeedWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (error) {
      if (error.message.includes("Status code 429") && i < retries - 1) {
        console.log(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

(async () => {
  try {
    const feed = await fetchFeedWithRetry("https://schibelli.dev/rss.xml");
    const readmePath = "README.md";
    const readme = fs.readFileSync(readmePath, "utf-8");

    const latestPosts = feed.items.slice(0, 5).map(item => `- [${item.title}](${item.link})`).join("\n");

    const updatedReadme = readme.replace(
      /## ✍️ Latest Posts on Mindware[\s\S]*?👉 \[More on schibelli\.dev\]\(https:\/\/schibelli\.dev\)/,
      `## ✍️ Latest Posts on Mindware\n\n${latestPosts}\n\n👉 [More on schibelli.dev](https://schibelli.dev)`
    );

    fs.writeFileSync(readmePath, updatedReadme);

    // Generate timestamp badge
    const timestamp = new Date().toISOString();
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="270" height="20">
      <rect width="270" height="20" fill="#555"/>
      <rect x="80" width="190" height="20" fill="#007ec6"/>
      <text x="10" y="14" fill="#fff" font-family="Verdana" font-size="11">Mindware Last Update</text>
      <text x="90" y="14" fill="#fff" font-family="Verdana" font-size="11">${timestamp}</text>
    </svg>
    `;
    fs.writeFileSync(badgePath, svg.trim());
  } catch (error) {
    console.error("Failed to update README:", error);
    process.exit(1);
  }
})();