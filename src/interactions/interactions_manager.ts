import { Client } from "discordx";
import { init as auth_button_init } from "./buttons/auth_button";
import { init as user_info_init } from "./commands/user_info";

export async function init(client: Client) {
    await auth_button_init();
    await user_info_init(client);
}