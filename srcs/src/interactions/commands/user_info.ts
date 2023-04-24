import {
	ApplicationCommandOptionType,
	CommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { Client, Discord, Slash, SlashOption } from "discordx";
import { Client as Client42 } from "42.js";
import { IUser } from "42.js/dist/structures/user";
import moment from "moment";

@Discord()
class UserInfo {
	@Slash({
		name: "user_info",
		description: "Get some info about a 42 student",
	})
	async userInfo(
		@SlashOption({
			name: "login",
			description: "User's login",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		login: string,
		interaction: CommandInteraction
	) {
		interaction.reply("Waiting...");
		const client42 = new Client42(
			<string>process.env.DISCORD_BOT_42_API_CLIENT_ID,
			<string>process.env.DISCORD_BOT_42_API_CLIENT_SECRET
		);
		const user: IUser | null = await client42.users.get(login);
		if (user) {
			const coa: any[] = await client42.fetch(
				"/users/" + login + "/coalitions?"
			);
			const coalition: any = coa.find((c: any) =>
				[45, 46, 47, 48].includes(c.id)
			);
			const primary_campus: any = user.campus_users.filter(
				(camp: any) => camp.is_primary
			)[0];
			const campus: any = user.campus.filter(
				(camp: any) => camp.id === primary_campus.campus_id
			)[0];
			const embed = new EmbedBuilder().setColor(
				coalition.color || "#000000"
			);
			embed
				.setAuthor({
					name: user.login,
					iconURL: user.image.link,
					url: "https://profile.intra.42.fr/users/" + user.login,
				})
				.setTitle(`${user.login}'s infos`)
				.setURL("https://profile.intra.42.fr/users/" + user.login)
				.setThumbnail(user.image.link)
				.setTimestamp()
				.setDescription(user.displayname)
				.addFields(
					{
						name: "piscine",
						value: `${user.pool_month} ${user.pool_year}`,
						inline: true,
					},
					{
						name: "email",
						value: user.email,
						inline: true,
					},
					{
						name: "wallets",
						value: user.wallet.toString(),
						inline: true,
					},
					{
						name: "campus",
						value: campus.city,
						inline: true,
					}
				);
			const cursus = user.cursus_users.filter(
				(cursus: any) => cursus.cursus_id === 21
			)[0];
			if (cursus) {
				embed.addFields(
					{
						name: "level",
						value: cursus.level.toString(),
						inline: true,
					},
					{
						name: "Black Hole absorption",
						value: moment(cursus.blackholed_at).format(
							"MMMM Do YYYY"
						),
						inline: true,
					}
				);
			}
			if (user["alumni?"])
				embed.addFields({ name: "alumni", value: "🟢", inline: true });
			if (user.groups.length) {
				let groups: any[] = [];
				user.groups.forEach((group: any) =>
					groups.push(group.name.toLowerCase())
				);
				embed.addFields({
					name: "groups",
					value: groups.join("\n"),
					inline: true,
				});
			}
			if (user.titles.length) {
				let titles: any[] = [];
				user.titles.forEach((title: any) =>
					titles.push(title.name.replace("%login", user.login))
				);
				embed.addFields({
					name: "titles",
					value: titles.join("\n"),
					inline: true,
				});
			}
			if (user.location)
				embed.addFields({
					name: "Location",
					value: user.location,
					inline: true,
				});
			interaction.editReply({ content: "", embeds: [embed] });
		} else {
			interaction.editReply({
				content: `${login} is not found in the 42's intranet.`,
			});
		}
	}
}

export async function init(client: Client) {
	await client.initApplicationCommands();
	console.log("User info command inited");
}
