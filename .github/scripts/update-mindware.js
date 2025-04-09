const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser();

(async () => {
  const feed = await parser.parseURL("https://schibelli.dev/rss.xml");
  const readmePath = "README.md";
  const readme = fs.readFileSync(readmePath, "utf-8");

  const latestPosts = feed.items.slice(0, 3).map(item => `- [${item.title}](${item.link})`).join("\n");

  const updatedReadme = readme.replace(
    /## ✍️ Latest Posts on Mindware[\\s\\S]*?👉 \[More on schibelli\.dev\]\(https:\/\/schibelli\.dev\)/,
    `## ✍️ Latest Posts on Mindware\n\n${latestPosts}\n\n👉 [More on schibelli.dev](https://schibelli.dev)`
  );

  fs.writeFileSync(readmePath, updatedReadme);
})();
