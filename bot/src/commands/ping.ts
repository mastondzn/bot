import { getLatency } from '~/modules/latency';
import { type BotCommand } from '~/types/client';

export const command: BotCommand = {
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    run: async ({ msg, chat: client }) => {
        const latency = getLatency();

        let messageToSend = `@${msg.userInfo.displayName}, pong! 🏓`;
        if (latency) messageToSend += ` (${latency}ms)`;

        await client.say(msg.channel, messageToSend, { replyTo: msg });
    },
};
