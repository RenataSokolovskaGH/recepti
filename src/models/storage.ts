import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class Storage extends Model {
    id: number;
    owner_user_id: number | null;
    file_hash: string;
    relative_file_path: string;
    file_type: string;
    checksum: string | null;
    created_at: string;
    updated_at: string;
    file_name: string | null;
    file_size: number | null;

    static get tableName() {
        return dbModels.storage.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                owner_user_id: { type: ['integer', 'null'] },
                file_hash: { type: 'string' },
                relative_file_path: { type: 'string' },
                file_type: { type: 'string' },
                checksum: { type: ['string', 'null'] },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
                file_name: { type: ['string', 'null'] },
                file_size: { type: ['integer', 'null'] },
            }
        };
    }
}
