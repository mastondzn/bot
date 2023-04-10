import { RefreshingAuthProvider } from '@twurple/auth';
import { eq } from 'drizzle-orm/expressions';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';

import { authedUsers, type UpdateAuthedUser } from './db/schema';
import { type Env } from './env';

export const makeRefreshingAuthProvider = async ({
    db,
    env,
}: {
    db: NodePgDatabase;
    env: Env;
}): Promise<RefreshingAuthProvider> => {
    const [botUser] = await db
        .select()
        .from(authedUsers)
        .where(eq(authedUsers.twitchId, env.TWITCH_BOT_ID))
        .limit(1);

    if (!botUser) throw new Error('Bot user not found!');

    const authProvider = new RefreshingAuthProvider({
        clientId: env.TWITCH_CLIENT_ID,
        clientSecret: env.TWITCH_CLIENT_SECRET,
        onRefresh: (userId, token) => {
            const updateAuthedUser: UpdateAuthedUser = {
                accessToken: token.accessToken,
                scopes: token.scope,
            };
            if (token.refreshToken) {
                updateAuthedUser.refreshToken = token.refreshToken;
            }
            if (token.expiresIn) {
                updateAuthedUser.expiresAt = new Date(Date.now() + token.expiresIn * 1000);
            }

            void db
                .update(authedUsers)
                .set(updateAuthedUser)
                .where(eq(authedUsers.twitchId, userId));
        },
        appImpliedScopes: botUser.scopes,
    });

    const expiresIn = botUser.expiresAt.getTime() - Date.now() / 1000;
    await authProvider.addUserForToken(
        {
            expiresIn,
            obtainmentTimestamp: botUser.obtainedAt.getTime(),
            refreshToken: botUser.refreshToken,
            scope: botUser.scopes,
        },
        ['chat']
    );

    return authProvider;
};
