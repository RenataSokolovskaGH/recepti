import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class Credentials extends Model {
    user_id: number;
    hash: string;
    salt: string;
    created_at: string;
    updated_at: string;

    static get tableName() {
        return dbModels.credentials.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                hash: { type: 'string' },
                salt: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
            }
        };
    }
}
