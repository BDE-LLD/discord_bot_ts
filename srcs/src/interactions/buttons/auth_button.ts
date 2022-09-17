import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { ButtonComponent, Discord } from "discordx";

import { initAuth } from "../../auth/auth_manager";

@Discord()
class AuthButton {
    @ButtonComponent({ id: "auth" })
    handler(interaction: ButtonInteraction): void {
        if(interaction.member && interaction.member.user) {
            const embed = new EmbedBuilder();
            const url = initAuth(interaction.member.user.id);
            embed
                .setTitle("Authentifie toi !")
                .setDescription(`Clique [ici](${url}) pour être redirigé sur la page d'authentification de 42.`)
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}

export async function init() {
    console.log("Auth button initialized");
}