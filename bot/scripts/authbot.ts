import inquirer from 'inquirer';
import { z } from 'zod';

import { authedUsers } from '~/db/schema';
import { env } from '~/env';
import { type DatabaseScript } from '~/types/scripts';

export const script: DatabaseScript = {
    description: 'get a new auth token for the bot',
    type: 'db',
    run: async ({ db }) => {
        const baseUrl = new URL('https://id.twitch.tv/oauth2/authorize');
        baseUrl.searchParams.set('client_id', env.TWITCH_CLIENT_ID);
        baseUrl.searchParams.set('redirect_uri', 'http://localhost:3000');
        baseUrl.searchParams.set('response_type', 'code');

        const botScopes = [
            'chat:edit',
            'chat:read',
            'whispers:read',
            'whispers:edit',
            'user:manage:whispers',
            'channel:moderate',
            'moderation:read',
            'moderator:manage:announcements',
            'moderator:manage:automod',
            'moderator:read:automod_settings',
            'moderator:manage:automod_settings',
            'moderator:manage:banned_users',
            'moderator:read:blocked_terms',
            'moderator:manage:blocked_terms',
            'moderator:manage:chat_messages',
            'moderator:read:chat_settings',
            'moderator:manage:chat_settings',
            'moderator:read:chatters',
            'moderator:read:followers',
            'moderator:read:shield_mode',
            'moderator:manage:shield_mode',
        ];

        baseUrl.searchParams.set('scope', botScopes.join(' '));
        console.log('Open this URL in your browser:');
        console.log(baseUrl.toString());
        //http://localhost:3000/?code=x0ddwecwv9c2rn647az6ges6vvu30c&scope=channel%3Amoderate+chat%3Aedit+chat%3Aread+whispers%3Aread+whispers%3Aedit+user%3Amanage%3Awhispers+moderation%3Aread+moderator%3Amanage%3Aannouncements+moderator%3Amanage%3Aautomod+moderator%3Aread%3Aautomod_settings+moderator%3Amanage%3Aautomod_settings+moderator%3Amanage%3Abanned_users+moderator%3Aread%3Ablocked_terms+moderator%3Amanage%3Ablocked_terms+moderator%3Amanage%3Achat_messages+moderator%3Aread%3Achat_settings+moderator%3Amanage%3Achat_settings+moderator%3Aread%3Achatters+moderator%3Aread%3Afollowers+moderator%3Aread%3Ashield_mode+moderator%3Amanage%3Ashield_mode

        const { url } = await inquirer.prompt<{ url: string }>({
            type: 'input',
            name: 'url',
            message: 'Paste the URL you were redirected to here:',
        });

        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        if (!code) throw new Error('No code found in URL!');
        const scopes = urlObj.searchParams.get('scope')?.split('\n');
        if (!scopes) throw new Error('No scopes found in URL!');

        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000`,
        });

        const responseSchema = z.object({
            access_token: z.string(),
            expires_in: z.number(),
            refresh_token: z.string(),
            scope: z.array(z.string()),
            token_type: z.string(),
        });

        const json = (await response.json()) as unknown;
        const data = responseSchema.parse(json);

        const expiresAt = Date.now() + data.expires_in * 1000 - 60 * 1000;

        await db.insert(authedUsers).values({
            twitchId: env.TWITCH_BOT_ID,
            twitchLogin: env.TWITCH_BOT_USERNAME,
            scopes: data.scope,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(expiresAt),
            obtainedAt: new Date(),
        });
    },
};
