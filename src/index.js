import { promises as fs } from "fs";
import Parser from "rss-parser";

const parser = new Parser();

// Parse feed data
const getArticles = () => 
	parser.parseURL("https://losdev.es/rss-articles").then((data) => data.items);

// Async function
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

	// Replace data
	const newData = template
		.replace("{{article-list}}", articlesMarkdown)

	// Write file
	await fs.writeFile("README.md", newData);

})();