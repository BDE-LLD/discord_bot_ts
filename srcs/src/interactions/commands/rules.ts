import { ActionRowBuilder, CommandInteraction, Message, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { Client, Discord, ModalComponent, Slash } from "discordx";
import { rules_channel_id } from "../../config.json";

@Discord()
class Rules {
    @Slash({
        name: "rules",
        description: "Edit Discord's rules",
    })
    async rules(interaction: CommandInteraction, client: Client) {
        const rulesChannel = await client.channels.fetch(rules_channel_id);
        if(rulesChannel && rulesChannel.isTextBased()) {
            let text = "";
            const message = await rulesChannel.messages.fetch({ limit: 1 });
            if (message.size != 0)
                text = message.first()?.content || "";
            const modal = new ModalBuilder()
            .setTitle("Edit rules")
            .setCustomId("RulesForm");

            const rulesInput = new TextInputBuilder()
            .setCustomId("rulesField")
            .setLabel("Edition")
            .setValue(text)
            .setStyle(TextInputStyle.Paragraph);
            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
                rulesInput
            );

            modal.addComponents(row);
            interaction.showModal(modal);
        }
        else
        {
            await interaction.reply({content: "Impossible to find rules channel", ephemeral: true });
        }
    }


    @ModalComponent()
    async RulesForm(interaction: ModalSubmitInteraction, client: Client): Promise<void> {
        const [newRules] = ["rulesField"].map((id) =>
          interaction.fields.getTextInputValue(id)
        );

        const rulesChannel = await client.channels.fetch(rules_channel_id);
        if(rulesChannel && rulesChannel.isTextBased()) {
            const message = await rulesChannel.messages.fetch({ limit: 1 });
            if (message.size != 0) {
                const msg: Message | undefined  = message.first();
                await msg?.edit(newRules);
                await interaction.reply({content: "Rules edited", ephemeral: true });
                return ;
            }
            await rulesChannel.send(newRules);
            await interaction.reply({content: "Rules created", ephemeral: true });
        }
        else
        {
            await interaction.reply({content: "Impossible to find rules channel", ephemeral: true });
        }

        return;
    }
}

export async function init(client: Client) {
    await client.initApplicationCommands();
    console.log("Rules command inited");
}