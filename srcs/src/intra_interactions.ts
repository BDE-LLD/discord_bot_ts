import { Client } from "discordx";
import express from "express";
import http from "http";
const { readFileSync, writeFileSync } = require("node:fs");
import config from "./config.json";

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

export function startIntraApp(client: Client) {
	let app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.post("/rules", async (req, res) => {
		if (!req.body) return res.sendStatus(400);

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
					body: JSON.stringify(req.body),
				});
			}
		}

		res.send("ok");
	});

	const httpServer = http.createServer(app);
	return httpServer;
}
