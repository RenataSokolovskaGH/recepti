import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class UserActivityLog extends Model {
    id: number;
    user_id: number;
    activity_type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any> | null;

    created_at: string;
    updated_at: string;

    static get tableName() {
        return dbModels.userActivityLog.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                activity_type: { type: 'string' },
                metadata: { type: ['object', 'null'] },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
            }
        };
    }
}
