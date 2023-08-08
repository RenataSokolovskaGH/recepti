import {
    AnyQueryBuilder,
    JSONSchema,
    Model
} from 'objection';
import {
    IAvatarSchema
} from '../interfaces';
import { Credentials, UsersSessions } from '.';
import { dbModels } from '../db/db-models';
import {
    storageHelper
} from '../helpers';
import { EStatuses, EUserAccountType } from '../enums';
import { routeConstants } from '../routes/definition';
import { userConstants } from '../constants';
import { UserProfileInfoSkeleton } from '../skeleton/models/user.models.skeleton';

export class User extends Model {
    id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    job_title: string | null;
    account_type: EUserAccountType;
    status: EStatuses;

    created_at: string;
    updated_at: string;

    avatar: IAvatarSchema | null;
    email: string | null;

    credential?: Credentials;
    session?: UsersSessions;

    static get tableName() {
        return dbModels.users.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                user_name: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                job_title: { type: ['string', 'null'] },
                account_type: { type: 'string' },
                status: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
                avatar: { type: ['object', 'null'] },
                email: { type: ['string', 'null'] },
            }
        };
    }

    static get modifiers() {
        return {
            available(builder: AnyQueryBuilder) {
                const { ref } = User;
                builder.whereNot(ref('status'), EStatuses.Revoked)
            },
            active(builder: AnyQueryBuilder) {
                const { ref } = User;
                builder.where(ref('status'), EStatuses.Active)
            }
        };
    }

    static get relationMappings() {
        return {
            credential: {
                relation: Model.HasOneRelation,
                modelClass: Credentials,
                join: {
                    from: `${dbModels.users.tableName}.id`,
                    to: `${dbModels.credentials.tableName}.user_id`,
                }
            },
            session: {
                relation: Model.HasOneRelation,
                modelClass: UsersSessions,
                join: {
                    from: `${dbModels.users.tableName}.id`,
                    to: `${dbModels.usersSessions.tableName}.user_id`,
                }
            }
        }
    }

    get fullName(

    ): string {
        return `${this.first_name} ${this.last_name}`;
    }

    userProfileBaseInfo(

    ): UserProfileInfoSkeleton {
        return {
            userId: this.id,
            firstName: this.first_name,
            lastName: this.last_name,
            userName: this.user_name,
            avatar: storageHelper.transformAvatarSchemaUrl(
                {
                    avatarSchema: this.avatar,
                    proxied: !!routeConstants.proxyRoute,
                    proxyRoute: routeConstants.proxyRoute,
                }

            ) || userConstants.defaultUserAvatar,

            jobTitle: this.job_title,
            accountType: this.account_type,
            email: this.email,
        }
    }
}
