import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class BlockedSources extends Model {
    id: number;
    ip: string;
    user_agent: string;
    user_id: number;

    static get tableName() {
        return dbModels.blockedSources.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                ip: { type: 'string' },
                user_agent: { type: 'string' },
            }
        };
    }
}

