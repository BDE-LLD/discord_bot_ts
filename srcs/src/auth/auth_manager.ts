const { readFileSync, writeFileSync } = require("node:fs");
import * as auth_list from "./users.json";

export function readDB(path: string) {
    try {
        const db = readFileSync(path);
        return JSON.parse(db);
    } catch (err) {
        console.error(err);
        return undefined;
    }
}
export function writeDB(path: string, data: string) {
    try {
        writeFileSync(path, JSON.stringify(data));
    } catch (err) {
        console.error(err);
    }
}

function generateUniqueCode() {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < 5; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

export function initAuth(discordUserId: string) {
	let db = readDB("./src/auth/users.json");
	const code = generateUniqueCode();
	db.push({ code: code, id: discordUserId });
	writeDB("./src/auth/users.json", db);
	const url = "https://auth." + process.env.DOMAIN + "?user_code=" + code;
	return url;
}