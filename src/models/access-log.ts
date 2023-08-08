import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';
import { EStatuses } from '../enums';

export class AccessLog extends Model {
    id: number;
    user_id: number | null;
    ip: string | null;
    user_agent: string | null;
    route: string | null;
    status: EStatuses;
    action_taken: boolean | null;

    created_at: string;
    updated_at: string;

    invalidRequestCount: number;
    routeVacancy: number;

    static get tableName() {
        return dbModels.accessLog.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_id: { type: ['integer', 'null'] },
                license_id: { type: ['integer', 'null'] },
                ip: { type: ['string', 'null'] },
                user_agent: { type: ['string', 'null'] },
                route: { type: ['string', 'null'] },
                status: { type: 'string' },
                action_taken: { type: ['boolean', 'null'] },
                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }
}
