import { promises as fs } from "fs";
import Parser from "rss-parser";
import fetch from "node-fetch";

const parser = new Parser();

const INSTAGRAM_REGEXP = new RegExp(/<script type="text\/javascript">window\._sharedData = (.*);<\/script>/);

// Parse feed data
const getArticles = () => 
	parser.parseURL("https://losdev.es/rss-articles").then((data) => data.items);

// Get photos from instagram
const getInstagramPhotos = async () => {
	const response = await fetch(`https://www.instagram.com/losdeveloper/`);
	const text = await response.text();
	const json = JSON.parse(text.match(INSTAGRAM_REGEXP)[1]);
	const edges = json.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.splice(0,8);
	return edges.map(({ node }) => ({
		permalink: `https://www.instagram.com/p/${node.shortcode}/`,
		media_url: node.thumbnail_src
	}));
};

// Instagram html markdown
const instagramHTML = ({ media_url, permalink }) => `
<a href='${permalink}' target='_blank'>
  <img width='130px' src='${media_url}' alt='losdeveloper photo' style='border-radius: 12px;'/>
</a>`;

// Async function
(async () => {

	const [template, articles, photos] = await Promise.all([
		fs.readFile("./src/README.md.tpl", { encoding: "utf-8" }),
		getArticles(),
		getInstagramPhotos()
	]);

	// Create articles markdown
	const articlesMarkdown = articles
		.slice(0, 5)
		.map(({ title, link }) => `- [${title}](${link})`)
		.join("\n");

	// Create photos html
	const instagramPhotos = photos
		.slice(0, 5)
		.map(instagramHTML)
		.join("");

	// Replace data
	const newData = template
		.replace("{{article-list}}", articlesMarkdown)
		.replace("{{instagram-photos}}", instagramPhotos);

	// Write file
	await fs.writeFile("README.md", newData);

})();