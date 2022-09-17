import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Client, Discord, Slash } from "discordx";
import { guild_id, roles } from "../../config.json";

@Discord()
class Info {
    @Slash({
        name: "info",
        description: "Informations about the BDE LLD",
    })
    async info(interaction: CommandInteraction, client: Client) {
        let embed = new EmbedBuilder();
        embed
			.setColor("#ef8058")
			.setAuthor({
				name: client.user?.tag || "LLD",
				iconURL: client.user?.avatarURL() || undefined,
			})
			.setThumbnail(client.user?.avatarURL() || null)
			.setTitle("La Liste Déchaînée")
			.setDescription("La Liste Déchaînée a le plaisir de se présenter à vous en tant que BDE de l'école 42 Paris. Animations, événements et bonne ambiance sont nos objectifs.")
			.addFields({name: "Source code", value: "https://github.com/BDE-LLD/lld_discord_bot_ts"});
        const guild = await client.guilds.fetch(guild_id);
		await guild.members.fetch();
		const bde = await guild.roles.fetch(roles.bde);
		const pre = await guild.roles.fetch(roles.president);
		const ca = await guild.roles.fetch(roles.ca);
        if(pre) {
            embed.addFields([
                {
                    name: "Guide suprême",
                    value: pre.members.map((m) => m.nickname || m.user.username).join("\n"),
                    inline: true,
                },
            ]);
        }
        if(ca) {
            embed.addFields([
                {
                    name: "Conseil d'administration",
                    value: ca.members.map((m) => m.nickname || m.user.username).join("\n"),
                    inline: true,
                },
            ]);
        }
        if(bde) {
            embed.addFields([
                {
                    name: "Membres",
                    value: bde.members.map((m) => m.nickname || m.user.username).join("\n"),
                    inline: true,
                },
            ]);
        }
		interaction.reply({ embeds: [embed] });
    }
}

export async function init(client: Client) {
    await client.initApplicationCommands();
    console.log("Info command inited");
}