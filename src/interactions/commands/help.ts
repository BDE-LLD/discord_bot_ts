import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Discord, Slash } from "discordx";

@Discord()
class Help {
    @Slash({
        name: "help",
        description: "List all caomnds and give informations about",
    })
    async help(interaction: CommandInteraction, client: Client) {
        let embed = new EmbedBuilder();
        embed
				.setAuthor({
					name: client.user?.tag || "LLD",
					iconURL: client.user?.avatarURL() || undefined,
				})
				.setThumbnail(client.user?.avatarURL() || null)
				.setTitle("**Man**")
				.setDescription(
					[
						`Hello, my name is ${client.user?.username} !! 🖐`,
						"\n**Commands :**",
						"\`/help\` : Show this help",
                        "\`/user_info\` : Show informations about a 42's student",
                        "\`/info\` : Show informations about LLD",
					].join("\n")
				)
			interaction.reply({ embeds: [embed] });
    }
}

export async function init(client: Client) {
    await client.initApplicationCommands();
    console.log("Help command inited");
}