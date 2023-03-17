import { Client } from "discordx";
import express from "express";
import http from "http";
const { readFileSync, writeFileSync } = require("node:fs");
import config from "./config.json";
const fetch = require("node-fetch2");

interface IEmbed {
	id: number;
	body: {
		title: string;
		description: string;
		color: string;
	};
	footer: {
		content: string;
	};
}

interface IDiscordEmbedBuilder {
	content: string;
	profile: {
		username: string;
		avatarUrl: string;
	};
	flags: {
		disableEmbeds: boolean;
		disableMentions: boolean;
	};
	embeds: IEmbed[];
}

function converToWebhook(webhook: any) {
	const { content, embeds, profile, flags } = webhook;
	const { username, avatarUrl } = profile;
	const { disableEmbeds, disableMentions } = flags;

	return {
		username: username,
		avatar_url: avatarUrl,
		content: content,
		embeds: embeds.map((embed: any) => {
			return {
				title: embed.body.title,
				description: embed.body.description,
				color: parseInt(embed.body.color.replace("#", ""), 16),
				footer: {
					text: embed.footer.content,
				},
			};
		}),
		flags: (disableEmbeds ? 4 : 0) | (disableMentions ? 4096 : 0),
	};
}

export function startIntraApp(client: Client) {
	let app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get("/rules", (req, res) => {
		res.send(JSON.parse(readFileSync("./rules.json", "utf8")));
	});

	app.post("/rules", async (req, res) => {
		if (!req.body) return res.sendStatus(400);

		writeFileSync("./rules.json", JSON.stringify(req.body));

		const channel = await client.channels.fetch(config.rules_channel_id);
		if (channel && channel.isTextBased()) {
			const message = await channel.messages.fetch({ limit: 1 });
			if (message.size != 0) {
				const msg = message.first();
				if (msg) {
					await msg.delete();
				}
			}
			if (process.env.RULES_WEBHOOK) {
				fetch(process.env.RULES_WEBHOOK, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(converToWebhook(req.body)),
				});
			}
		}

		res.send("ok");
	});

	const httpServer = http.createServer(app);
	return httpServer;
}
