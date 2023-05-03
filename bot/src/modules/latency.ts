import chalk from 'chalk';

import { type BotModule } from '~/types/client';

let latency: number | null = null;
export const getLatency = (): number | null => latency;

const logPrefix = chalk.bgCyan('[module:latency]');

export const module: BotModule = {
    name: 'latency',
    priority: 20,
    register: ({ chat }) => {
        const handshake = async () => {
            const pingStart = Date.now();
            await chat.ping();
            const pingEnd = Date.now();

            latency = pingEnd - pingStart;
        };

        void handshake();
        setInterval(
            () => handshake().catch(() => console.error(logPrefix, 'handshake failed')),
            1000 * 60 * 2
        );
    },
};
