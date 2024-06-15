import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, varchar } from 'drizzle-orm/pg-core';

export const localPermissions = pgTable(
    'local_permissions',
    {
        channelId: varchar('channel_id', { length: 256 }).notNull(),
        channelLogin: varchar('channel_login', { length: 256 }).notNull(),

        userId: varchar('user_id', { length: 256 }).notNull(),
        userLogin: varchar('user_login', { length: 256 }).notNull(),

        // other permissions are determined by the incoming irc tags
        permission: varchar('permission', {
            length: 64,
            enum: ['banned', 'ambassador'],
        }).notNull(),

        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({ cpk: primaryKey({ columns: [table.channelId, table.userId] }) }),
);
export type LocalPermission = InferSelectModel<typeof localPermissions>;
export type NewLocalPermission = InferInsertModel<typeof localPermissions>;
export type UpdateLocalPermission = Partial<LocalPermission>;
export type DatabaseLocalPermission = LocalPermission['permission'];

export const globalPermissions = pgTable('global_permissions', {
    userId: varchar('user_id', { length: 256 }).primaryKey(),
    userLogin: varchar('user_login', { length: 256 }).notNull(),
    permission: varchar('permission', { length: 64, enum: ['banned', 'owner'] }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type GlobalPermission = InferSelectModel<typeof globalPermissions>;
export type NewGlobalPermission = InferInsertModel<typeof globalPermissions>;
export type UpdateGlobalPermission = Partial<GlobalPermission>;
export type DatabaseGlobalPermission = GlobalPermission['permission'];
