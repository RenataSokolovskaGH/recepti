import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';
import { EKnownUserSessionLifeTime } from '../enums';
import { KnownSessionSchema } from '../skeleton/models/known-sessions.models.skeleton';

export class KnownUsersSessions extends Model {
    id: number;
    ip: string;
    user_agent: string | null;
    user_id: number;
    os: string;
    browser: string;
    version: string;
    platform: string;
    life_time: EKnownUserSessionLifeTime;

    created_at: string;
    updated_at: string;

    static get tableName() {
        return dbModels.knownUsersSessions.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                user_agent: { type: ['string', 'null'] },
                ip: { type: 'string' },
                message: { type: ['string', 'null'] },
                os: { type: 'string' },
                browser: { type: 'string' },
                version: { type: 'string' },
                platform: { type: 'string' },
                life_time: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }

    knownSessionSchema(

    ): KnownSessionSchema {
        return {
            id: this.id,
            userId: this.user_id,
            clientIp: this.ip,
            clientUserAgent: this.user_agent,
            createdAt: this.created_at,
            lastUsedAt: this.updated_at,
            os: this.os,
            browser: this.browser,
            version: this.version,
            platform: this.platform
        }
    }
}
