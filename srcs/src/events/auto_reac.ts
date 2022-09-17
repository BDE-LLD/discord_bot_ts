import { ArgsOf, Client, Discord, On } from "discordx";
import { auto_reac as config } from "../config.json";

@Discord()
class AutoReac {
    @On({ event: "messageCreate" })
    async onMessage([message]: ArgsOf<"messageCreate">, client: Client) {
        if (message.author.bot) return;
        if (config.disabled_channels.includes(message.channelId)) return;
        for (const react of config.reactions) {
            let emoji: string | null = null;
            if (react.emoji_type === "unicode") {
                emoji = react.emoji;
            } else if (react.emoji_type === "custom") {
                const guildEmoji = await client.emojis.cache.find((e) => e.name === react.emoji);
                if (guildEmoji) emoji = guildEmoji.toString();
            }
            if(emoji == null) continue;
            message.content.split(" ").forEach((word) => {
                if (react.keywords.includes(word.toLowerCase())) {
                    message.react(emoji || "");
                }
            });
            if(react.triggered_by_mention && message.mentions.everyone) {
                message.react(emoji || "");
            }
        }
    }
}

export async function init() {
    console.log("Inited auto reac event");
}