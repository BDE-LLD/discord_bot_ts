import { Client } from "discordx";
import { init as auth_button_init } from "./buttons/auth_button";
import { init as user_info_init } from "./commands/user_info";
import { init as help_init } from "./commands/help";
import { init as info_init } from "./commands/info";

export async function init(client: Client) {
    await auth_button_init();
    await user_info_init(client);
    await help_init(client);
    await info_init(client);
}