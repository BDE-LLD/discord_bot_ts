import {
	ApplicationCommandType,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
} from "discord.js";
import { Client, ContextMenu, Discord } from "discordx";

@Discord()
class AddRole {
	@ContextMenu({
		name: "Add role to list of users",
		type: ApplicationCommandType.Message,
	})
	async messageHandler(interaction: MessageContextMenuCommandInteraction) {
		const message = interaction.targetMessage;
		const role = message.mentions.roles.first();
		const users = message.content.split("\n").slice(1);
		if (!role || !users || users.length === 0) {
			const embed = new EmbedBuilder()
				.setColor("#ff4444")
				.setTitle("Erreur")
				.setDescription(
					"Le message n'est pas au bon format. Il doit contenir une mention de rôle et une liste d'utilisateurs.\nExemple:\n\n```\n@role\nuser1\nuser2\n...\n```"
				);
			interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}
		interaction.deferReply();
		let found: string[] = [];
		let notFound: string[] = [];
		const guildMembers = await interaction.guild?.members.fetch();
		for (const user of users) {
			if (!guildMembers)
				return false;
			const member = guildMembers.find((member) => {
				const login = member.displayName.match(/ \((.*)\)/);
				if (login) {
					return login[1] === user;
				}
				return false;
			});
			if (!member) {
				notFound.push(user);
				continue;
			}
			if (member.roles.cache.has(role.id)) {
				continue;
			}
			found.push(member.displayName);
			await member.roles.add(role);
		}
		setTimeout(() => {
			const embed = new EmbedBuilder()
				.setColor("#00C851")
				.setTitle("Rôle ajouté")
				.setDescription(
					"Le rôle a été ajouté à " +
						found.length +
						" utilisateurs.\n\n" +
						notFound.length +
						" utilisateurs n'ont pas été trouvés."
				)
				.setFields([
					{
						name: "Utilisateurs non trouvés",
						value: notFound.join("\n"),
						inline: true,
					},
				]);
			interaction.editReply({ embeds: [embed] });
		}, 1000);
	}
}

export async function init(client: Client) {
	console.log("Add role menu inited");
}
