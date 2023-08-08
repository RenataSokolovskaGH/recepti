import { AnyQueryBuilder, JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';
import { EStatuses } from '../enums';

export class FailedLoginAttempts extends Model {
    id: number;
    client_ip: string;
    user_name: string;
    status: EStatuses;
    resolved: boolean;

    maxAllowedLoginThreshold?: number;

    static get tableName() {
        return dbModels.failedLoginAttempts.tableName;
    }

    static get modifiers() {
        return {
            unresolved(builder: AnyQueryBuilder) {
                const { ref } = FailedLoginAttempts;
                builder.where(ref('resolved'), 0)
            }
        };
    }


    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                client_ip: { type: 'string' },
                user_name: { type: 'string' },
                status: { type: 'string' },
                resolved: { type: 'boolean' }
            }
        };
    }
}
