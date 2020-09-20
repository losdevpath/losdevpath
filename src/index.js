import { promises as fs } from "fs";
import Parser from "rss-parser";
import fetch from "node-fetch";

const parser = new Parser()
const getArticles = () => parser.parseURL("https://losdev.es/rss-articles").then((data) => data.items);

(async () => {
	const [template, articles] = await Promise.all([
		fs.readFile("./src/README.md.tpl", { encoding: "utf-8" }),
		getArticles()
	]);

	// Create articles markdown
	const articlesMarkdown = articles
		.slice(0, 5)
		.map(({ title, link }) => `- [${title}](${link})`)
		.join("\n");

	// Replace markdown with data
	const markdown = template
		.replace("{{article-list}}", articlesMarkdown);

	// Replace markdown with data
	await fs.writeFile("README.md", markdown);
})();