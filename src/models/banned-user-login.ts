import { AnyQueryBuilder, JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class BannedUserLogin extends Model {
    id: number;
    user_name: string;
    expired_at: string;

    static get tableName() {
        return dbModels.bannedUserLogin.tableName;
    }

    static get modifiers() {
        return {
            valid(builder: AnyQueryBuilder) {
                const { ref, fn } = BannedUserLogin;
                builder.where(ref('expired_at'), '>', fn.now());
            }
        };
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_name: { type: 'string' },
                expired_at: { type: 'string' }
            }
        };
    }
}
