import {
	CommandInteraction,
	GuildMember,
	PermissionFlagsBits,
	Collection,
	Role,
} from "discord.js";
import { Client, Discord, Slash } from "discordx";
import { guild_id, auth, roles } from "../../config.json";
import { Client as Client42 } from "42.js";

@Discord()
class Purge {
	@Slash({
		name: "purge",
		description: "Clean all the users",
	})
	async purge(interaction: CommandInteraction, client: Client) {
		await interaction.reply("Start cleaning...");
		const guild = await client.guilds.fetch(guild_id);
		await guild.members.fetch();
		const students = await guild.roles.fetch(auth.roles.student);
		const pisciners = await guild.roles.fetch(auth.roles.pisciner);
		interaction.editReply({
			content: `Cleaning ${
				(students?.members?.size || 0) + (pisciners?.members?.size || 0)
			} users...`,
		});
		const client42 = new Client42(
			<string>process.env.DISCORD_BOT_42_API_CLIENT_ID,
			<string>process.env.DISCORD_BOT_42_API_CLIENT_SECRET
		);
		let remove_pisciners = 0;
		let remove_students = 0;
		if (pisciners?.members) {
			for (const user of pisciners?.members) {
				if (
					user[1].roles.cache.find(
						(role) => role.id === roles.bde || user[1].user.bot
					)
				) {
					continue;
				}
				const name = user[1].nickname || user[1].user.username;
				const login = name.match(/ \((.*)\)/);
				if (login && login.length > 0) {
					const user42 = await client42.users.get(login[1]);
					if (!user42) {
						await user[1].roles.remove(auth.roles.pisciner);
						await user[1].roles.add(auth.roles.extern);
						remove_pisciners++;
						continue;
					}
					const cursus = user42.cursus_users.find(
						(cursus) => cursus.cursus_id == 9
					);
					if (!cursus) {
						await user[1].roles.remove(auth.roles.pisciner);
						await user[1].roles.add(auth.roles.extern);
						remove_pisciners++;
						continue;
					}
					const today = new Date();
					const end = new Date(cursus.end_at);
					if (today > end) {
						await user[1].roles.remove(auth.roles.pisciner);
						await user[1].roles.add(auth.roles.extern);
						remove_pisciners++;
						continue;
					}
					continue;
				} else {
					await user[1].roles.remove(auth.roles.pisciner);
					await user[1].roles.add(auth.roles.extern);
					remove_pisciners++;
					continue;
				}
			}
		}
		if (students?.members) {
			for (const user of students?.members) {
				const name = user[1].nickname || user[1].user.username;
				const login = name.match(/ \((.*)\)/);
				const bde =
					user[1].roles.cache.find((role) => role.id === roles.bde) ||
					user[1].roles.cache.find((role) => role.id === auth.roles.staff);
				if (login && login.length > 0) {
					const user42 = await client42.users.get(login[1]);
					if ((!user42 && bde) || user[1].user.bot) {
						continue;
					}
					if (!user42) {
						await user[1].roles.remove(auth.roles.student);
						await user[1].roles.add(auth.roles.extern);
						remove_students++;
						continue;
					}
					const cursus = user42.cursus_users.find(
						(cursus) => cursus.cursus_id == 21
					);
					if (
						(!cursus && bde) ||
						user42.cursus_users.find((cursus) => cursus.cursus_id == 1)
					) {
						continue;
					}
					if (!cursus) {
						await user[1].roles.remove(auth.roles.student);
						await user[1].roles.add(auth.roles.extern);
						remove_students++;
						continue;
					}
					const today = new Date();
					const end = new Date(cursus.blackholed_at);
					if (today > end && cursus.blackholed_at != null && !bde) {
						await user[1].roles.remove(auth.roles.student);
						await user[1].roles.add(auth.roles.extern);
						remove_students++;
						continue;
					}
					const coalitions: any[] = await client42.fetch(
						"users/" + user42.id + "/coalitions_users?"
					);
					let coa: any = null;
					for (const c of coalitions) {
						for (const co of auth.coalitions) {
							if (c.coalition_id == co.coa_id) {
								coa = co;
								break;
							}
						}
					}
					if (coa) {
						if (!user[1].roles.cache.find((role) => role.id === coa.role))
							await user[1].roles.add(coa.role);
						let theoric_name = `${
							user42.usual_first_name || user42.first_name
						} (${user42.login}) ${coa.emoji}`;
						if (name != theoric_name && !bde) {
							await user[1].setNickname(theoric_name);
						}
					}
				} else {
					if (!bde) {
						await user[1].roles.remove(auth.roles.student);
						await user[1].roles.add(auth.roles.extern);
						remove_students++;
						continue;
					}
				}
			}
		}
		interaction.editReply({
			content: `Cleaning done, ${remove_pisciners} pisciners and ${remove_students} students removed.`,
		});
	}
	@Slash({
		name: "purge-close-students",
		description: "Close all students that are closed",
		defaultMemberPermissions: [PermissionFlagsBits.Administrator],
	})
	async purge_close_students(interaction: CommandInteraction, client: Client) {
		await interaction.deferReply();

		const client42 = new Client42(
			<string>process.env.DISCORD_BOT_42_API_CLIENT_ID,
			<string>process.env.DISCORD_BOT_42_API_CLIENT_SECRET
		);

		const guild = await client.guilds.fetch(guild_id);
		await guild.members.fetch();
		const students = await guild.roles.fetch(auth.roles.student);
		const pisciners = await guild.roles.fetch(auth.roles.pisciner);

		let purgedPisciners:
			| {
					discordId: string;
					displayName: string;
					reason: string;
			  }[]
			| undefined = [];
		let purgedStudents:
			| {
					discordId: string;
					displayName: string;
					reason: string;
			  }[]
			| undefined = [];
		if (pisciners?.members)
			purgedPisciners = await purgeMembers(pisciners, client42);
		if (students?.members)
			purgedStudents = await purgeMembers(students, client42);
		interaction.reply({
			content: `Purged pisciners: ${purgedPisciners?.length}\nPurged students: ${purgedStudents?.length}`,
		});
		interaction.channel?.send({
			content: `Pisciners: ${purgedPisciners
				?.map((p) => p.displayName + ", " + p.reason + " " + p.discordId)
				.join("\n")}`,
		});
		interaction.channel?.send({
			content: `Students: ${purgedStudents
				?.map((p) => p.displayName + ", " + p.reason + " " + p.discordId)
				.join("\n")}`,
		});
	}
}

export async function init(client: Client) {
	await client.initApplicationCommands();
	console.log("Purge command inited");
}

async function purgeMembers(role: Role, client42: Client42) {
	for (const [snowflake, member] of role.members) {
		let purgedMembers: {
			discordId: string;
			displayName: string;
			reason: string;
		}[] = [];
		try {
			const match = member.displayName.match(/ \((.*)\)/);
			if (!match || match.length < 2)
				throw new Error("No login", { cause: { code: 404 } });
			const login = match[1];
			const user42 = await client42.users.get(login);
			if (!user42)
				throw new Error("Student not found", {
					cause: { code: 404 },
				});
			if (!user42["active?"])
				throw new Error("User is not active", { cause: { code: 403 } });
		} catch (error: any) {
			if (error.cause && error.cause.code == 404) {
				await member.roles.remove(role.id);
				purgedMembers.push({
					discordId: member.id,
					displayName: member.displayName,
					reason: "No login || Stud not found",
				});
			} else if (error.cause && error.cause.code == 403) {
				await member.roles.remove(role.id);
				purgedMembers.push({
					discordId: member.id,
					displayName: member.displayName,
					reason: "User is not active",
				});
			}
		}
		return purgedMembers;
	}
}
