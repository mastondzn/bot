import { defineCommand, parseUserParameter } from '~/helpers/command';
import { permissions } from '~/providers/permissions';

export default defineCommand({
    name: 'manage',
    description: 'Lets ambassadors or broadcasters manage the bot in their channels.',
    permissions: {
        local: 'ambassador',
        global: 'owner',
        mode: 'any',
    },
    usage: [
        'manage ban <user>', //
        'Sets the user to banned permission, preventing them from using the bot in the current channel.',

        'manage unban <user>',
        'Sets the user to normal permission, re-allowing them to use the bot in the current channel.',
    ].join('\n'),

    subcommands: [{
        path: ['ban'],
        run: async (context) => {
            const message = context.message;

            const user = await parseUserParameter(context, 1, true);
            if (!user.ok) {
                return { reply: user.reason };
            }

            const isBroadcaster = message.channelName === user.login;
            const isSelf = message.senderUsername === user.login;
            if (isBroadcaster) {
                return { reply: 'You can\'t ban the broadcaster.' };
            }
            if (isSelf) {
                return { reply: 'You can\'t ban yourself.' };
            }

            const channel = {
                login: message.channelName,
                id: message.channelID,
            };

            const isAmbassador
                    = (await permissions.getDbLocalPermission(channel.id, user.id)) === 'ambassador';
            if (isAmbassador) {
                return { reply: `You can't ban ${user.login}.` };
            }

            const isOwner = (await permissions.getGlobalPermission(user.id)) === 'owner';
            if (isOwner) {
                return { reply: `You can't ban ${user.login}.` };
            }

            const currentPermission
                    = (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

            if (currentPermission === 'banned') {
                return {
                    reply: `User ${user.login} is already banned from using the bot locally.`,
                };
            }
            await permissions.setLocalPermission('banned', { channel, user });
            return {
                reply: `Banned user ${user.login} from using the bot in this channel.`,
            };
        },
    }, {
        path: ['unban'],
        run: async (context) => {
            const message = context.message;

            const user = await parseUserParameter(context, 1, true);
            if (!user.ok) {
                return { reply: user.reason };
            }

            const isBroadcaster = message.channelName === user.login;
            const isSelf = message.senderUsername === user.login;
            if (isBroadcaster) {
                return { reply: 'You can\'t ban the broadcaster.' };
            }
            if (isSelf) {
                return { reply: 'You can\'t ban yourself.' };
            }

            const channel = { login: message.channelName, id: message.channelID };

            const isAmbassador
                    = (await permissions.getDbLocalPermission(channel.id, user.id)) === 'ambassador';
            if (isAmbassador) {
                return { reply: `You can't ban ${user.login}.` };
            }

            const isOwner = (await permissions.getGlobalPermission(user.id)) === 'owner';
            if (isOwner) {
                return { reply: `You can't ban ${user.login}.` };
            }

            const currentPermission
                    = (await permissions.getDbLocalPermission(channel.id, user.id)) ?? 'normal';

            if (currentPermission === 'normal') {
                return {
                    reply: `User ${user.login} is not currently banned from using the bot locally.`,
                };
            }
            await permissions.setLocalPermission('normal', { channel, user });
            return {
                reply: `Unbanned user ${user.login} from using the bot in this channel.`,
            };
        },
    }],

    run: () => {
        return {
            reply: 'Please specify a subcommand such as \'sb manage ban <user>\' or \'sb manage unban <user>\'.',
        };
    },
});
