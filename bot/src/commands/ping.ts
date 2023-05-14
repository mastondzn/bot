import ms from 'pretty-ms';

import { getLatency } from '~/modules/latency';
import { type BotCommand } from '~/types/client';

const startedAt = new Date();

export const command: BotCommand = {
    name: 'ping',
    description: 'Replies with pong! To ensure the bot is alive.',
    aliases: ['pong'],
    run: async ({ reply, params }) => {
        const lines = [];

        if (params.command === 'pong') lines.push('Ping 🏓!');
        else lines.push('Pong 🏓!');

        const latency = getLatency();
        if (latency) lines.push(`Latency is ${latency}ms.`);

        lines.push(
            `Uptime is ${ms(Date.now() - startedAt.getTime(), {
                unitCount: 2,
                secondsDecimalDigits: 0,
            })}.`
        );

        return await reply(lines.join(' '));
    },
};
