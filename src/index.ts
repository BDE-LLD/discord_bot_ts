import "dotenv/config";
import "reflect-metadata";
import { GatewayIntentBits } from "discord.js";
import { Client } from "discordx";
import { guild_id } from "./config.json";
import { init as initEvents } from "./events/events_manager";
import { init as initInteractions } from "./interactions/interactions_manager";
import { create_buttons } from "./create_buttons";

const token = process.env.DISCORD_TOKEN;

async function start() {
  const client = new Client({
    intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
    botGuilds: [guild_id],
  });

  client.once("ready", async () => {
    await create_buttons(client);
    console.log("Created buttons");
    await initEvents();
    await initInteractions();
    console.log(client.user?.username + " is ready!");
  });

  client.on("interactionCreate", (interaction) => {
    client.executeInteraction(interaction);
  });

  await client.login(token || "");
}
start();
