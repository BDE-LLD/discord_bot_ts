import { ButtonInteraction } from "discord.js";
import { ButtonComponent, Discord } from "discordx";

@Discord()
class AuthButton {
    @ButtonComponent({ id: "auth" })
    handler(interaction: ButtonInteraction): void {
        
    }
}

export async function init() {
    console.log("Auth button initialized");
}