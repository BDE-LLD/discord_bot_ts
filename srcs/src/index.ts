import "dotenv/config";
import "reflect-metadata";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import { guild_id } from "./config.json";
import { init as initEvents } from "./events/events_manager";
import { init as initInteractions } from "./interactions/interactions_manager";
import { create_buttons } from "./create_buttons";
import { startApp } from "./auth/server";
import express from "express";
import http from "http";
import { startIntraApp } from "./intra_interactions";

const token = process.env.DISCORD_BOT_TOKEN;

async function start() {
	const client = new Client({
		intents: [
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.MessageContent,
		],
		botGuilds: [guild_id],
	});

	client.once("ready", async () => {
		await create_buttons(client);
		console.log("Created buttons");
		await initEvents();
		console.log("Inited events");
		await initInteractions(client);
		console.log("Inited interactions");
		console.log(client.user?.username + " is ready!");
	});

	client.on("interactionCreate", (interaction) => {
		client.executeInteraction(interaction);
	});

	const httpServer = startApp(client);
	await client.login(token || "");
	const port = 3000;
	httpServer.listen(port, () => {
		console.log("Auth server running on port " + port);
	});

	const intraServer = startIntraApp(client);
	const intraPort = 4242;
	intraServer.listen(intraPort, () => {
		console.log("Intra server running on port " + intraPort);
	});
}
start();
