import { promises as fs } from "fs";
import Parser from "rss-parser";
import Instagram from 'node-instagram';

const parser = new Parser();

// Parse feed data
const getArticles = () => {
	return parser.parseURL("https://losdev.es/rss-articles").then((data) => data.items);
}

const instagram = new Instagram({
	clientId: process.env.INSTAGRAM_APP_ID,
	clientSecret: process.env.INSTAGRAM_APP_SECRET,
	accessToken: process.env.INSTAGRAM_TOKEN,
});

// Async function
(async () => {

	instagram.get('users/self', (err, data) => {
		if (err) {
			// an error occured
			console.log(err);
		} else {
			console.log(data);
		}
	});

	return;

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