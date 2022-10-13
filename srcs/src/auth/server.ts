import { Client } from "discordx";

require("dotenv").config();

import express from "express";
import axios from "axios";
import http from "http";
import url from "url";
import { readDB } from "./auth_manager";
import { guild_id, auth, roles } from "../config.json";
import { IUser } from "42.js/dist/structures/user";
import { Client as Client42 } from "42.js";

async function getUserInformations(
	token: string,
	user_res: any,
	user_code: string,
	client: Client
) {
	const config = {
		headers: {
			Authorization: "Bearer " + token,
		},
	};
	axios
		.get("https://api.intra.42.fr/v2/me", config)
		.then(async (res: any) => {
			const db = readDB("./src/auth/users.json");
			console.log(res.data.login + " logged !");
			const found = db.find((o: any) => o.code === user_code);
			validateAuth(found.id, res.data, client);
			user_res.status(200).send("Bienvenue " + res.data.login + "!");
		})
		.catch((err: any) => {
			console.error("Impossible to get user's informations:");
			console.log(err);
			user_res
				.status(400)
				.send("Désolé, nous n'avons pas pu récupérer tes informations");
		});
}

async function validateAuth(
	discordUserId: string,
	user: IUser,
	client: Client
) {
	const guild = await client.guilds.fetch(guild_id);
	const member = await guild.members.fetch(discordUserId);

	const bocal = user["staff?"];
	const tuteur = user.groups.find((g: any) => g.id == 40);
	const stud = user.achievements.find((a: any) => a.id == 1);

	const client42 = new Client42(
		<string>process.env.DISCORD_BOT_42_API_CLIENT_ID,
		<string>process.env.DISCORD_BOT_42_API_CLIENT_SECRET
	);
	const coalitions: any[] = await client42.fetch(
		"users/" + user.id + "/coalitions_users?"
	);
	let nickname = `${user.usual_first_name || user.first_name} (${user.login})`;
	let coa = null;
	for (const c of coalitions) {
		for (const co of auth.coalitions) {
			if (c.coalition_id == co.coa_id) {
				coa = co;
				break;
			}
		}
	}
	if (coa) nickname += ` ${coa.emoji}`;

	try {
		await member.setNickname(nickname);
		if (bocal) await member.roles.add(auth.roles.staff);
		if (tuteur) await member.roles.add(auth.roles.tutor);
		if (stud || tuteur || bocal) await member.roles.add(auth.roles.student);
		else await member.roles.add(auth.roles.pisciner);
		if (coa) await member.roles.add(coa.role);
		console.log(`${user.login} is set up`);
	} catch (err) {
		console.error(err);
	}
}

export function startApp(client: Client) {
	let app = express();

	app.get("/", function (req: any, res: any) {
		const db = readDB("./src/auth/users.json");
		const user_code = req.query.user_code;
		const found = db.some((o: any) => o.code === user_code);
		if (!user_code || !found)
			res
				.status(400)
				.send("Désolé, nous n'avons pas pu récupérer ton code unique !");
		else
			res.redirect(
				"https://api.intra.42.fr/oauth/authorize?client_id=" +
					process.env.DISCORD_BOT_42_API_CLIENT_ID +
					"&redirect_uri=https%3A%2F%2Fauth." +
					process.env.DOMAIN +
					"%2F42result?user_code=" +
					user_code +
					"&response_type=code"
			);
	});

	app.get("/42result", function (req: any, user_res: any) {
		if (req.query.error || !req.query.code || !req.query.user_code) {
			console.error("Error occured during auth");
			user_res.status(400).send("Désolé, nous n'avons pas pu t'identifier !");
		} else {
			const db = readDB("./src/auth/users.json");
			const code = req.query.code;
			const user_code = req.query.user_code;
			const found = db.some((o: any) => o.code === user_code);
			if (!found)
				user_res
					.status(400)
					.send("Désolé, nous n'avons pas pu récupérer ton code unique !");
			const params = {
				grant_type: "authorization_code",
				client_id: process.env.DISCORD_BOT_42_API_CLIENT_ID,
				client_secret: process.env.DISCORD_BOT_42_API_CLIENT_SECRET,
				code: code,
				redirect_uri:
					"https://auth." +
					process.env.DOMAIN +
					"/42result?user_code=" +
					user_code,
			};
			axios
				.post("https://api.intra.42.fr/oauth/token", params)
				.then(async (res: any) => {
					await getUserInformations(
						res.data.access_token,
						user_res,
						user_code,
						client
					);
				})
				.catch((err: any) => {
					console.error("Impossible to transform user's code into token:");
					console.log(err);
					user_res
						.status(400)
						.send("Désolé, nous n'avons pas pu récupérer tes informations !");
				});
		}
	});

	app.get("/discord", async (req: any, res: any) => {
		console.log(req.query);
		const params = new url.URLSearchParams();
		params.append("grant_type", "authorization_code");
		params.append("client_id", process.env.DISCORD_BOT_CLIENT_ID || "");
		params.append("client_secret", process.env.DISCORD_BOT_CLIENT_SECRET || "");
		params.append("code", req.query.code);
		params.append(
			"redirect_uri",
			"https://auth." + process.env.DOMAIN + "/discord"
		);
		let res_auth = await axios.post(
			"https://discord.com/api/oauth2/token",
			params,
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);
		/* .then(async (result: any) => {
				console.log(result.data);
				const user = await axios.get("https://discord.com/api/users/@me", {
					headers: {
						Authorization: `Bearer ${result.data.access_token}`,
					},
				});
				console.log(user.data);
				const guild = await client.guilds.fetch(guild_id);
				await guild.members.add(user.data.id, {
					accessToken: result.data.access_token,
				});
				res.status(200).send("Works !");
			})
			.catch((err: any) => {
				console.error("Oops, something went wrong:");
				console.log(err);
				return res
					.status(400)
					.send("Désolé, nous n'avons pas pu récupérer tes informations !");
			}); */
		try {
			const user = await axios.get("https://discord.com/api/users/@me", {
				headers: {
					Authorization: `Bearer ${res_auth.data.access_token}`,
				},
			});
			console.log(user.data);
			const guild = await client.guilds.fetch(guild_id);
			let member = await guild.members.fetch(user.data.id);
			if (!member) {
				await guild.members.add(user.data.id, {
					accessToken: res_auth.data.access_token,
					// roles: [roles.hackathon],
				});
			} else {
				await member.roles.add(roles.hackathon);
			}
			res.status(200).send("Works !");
		} catch (err: any) {
			console.error("Oops, something went wrong:");
			console.error(err);
			return res
				.status(400)
				.send("Désolé, nous n'avons pas pu récupérer tes informations !");
		}
	});
	const httpServer = http.createServer(app);
	return httpServer;
}
