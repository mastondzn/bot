import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const states = pgTable('auth_states', {
    state: varchar('state', { length: 64 }).primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type State = InferSelectModel<typeof states>;
export type NewState = InferInsertModel<typeof states>;
