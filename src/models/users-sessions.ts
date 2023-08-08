import { AnyQueryBuilder, JSONSchema, Model } from 'objection';
import { KnownUsersSessions, User } from '.';
import { dbModels } from '../db/db-models';
import { EStatuses } from '../enums';

export class UsersSessions extends Model {
    id: number;
    user_id: number;
    access_token: string;
    status: EStatuses;
    expired_at: string;
    created_at: string;
    updated_at: string;
    known_session_id: number | null;

    user?: User;
    knownSession?: KnownUsersSessions;

    static get tableName() {
        return dbModels.usersSessions.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                access_token: { type: 'string' },
                status: { type: 'string' },
                expired_at: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
                known_session_id: { type: ['integer', 'null'] },
            }
        };
    }

    static get modifiers() {
        return {
            active(builder: AnyQueryBuilder) {
                const { ref, fn } = UsersSessions;
                builder
                    .where(ref('status'), EStatuses.Active)
                    .where(ref('expired_at'), '>', fn.now());
            }
        };
    }

    static get relationMappings() {
        return {
            knownSession: {
                relation: Model.HasOneRelation,
                modelClass: KnownUsersSessions,
                join: {
                    from: `${dbModels.usersSessions.tableName}.known_session_id`,
                    to: `${dbModels.knownUsersSessions.tableName}.id`,
                }
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${dbModels.usersSessions.tableName}.user_id`,
                    to: `${dbModels.users.tableName}.id`,
                }
            }
        }
    }
}

