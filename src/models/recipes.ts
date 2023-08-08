import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class Recipes extends Model {
    id: number;
    name: string;
    ingredients: string;
    allergens: string;
    avatar: string | null;
    description: string;
    is_sweet: boolean;

    created_at: string;
    updated_at: string;


    static get tableName() {
        return dbModels.recipes.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                ingredients: { type: 'string' },
                allergens: { type: ['string', 'null'] },
                avatar: { type: ['string', 'null'] },
                description: { type: 'string' },
                is_sweet: { type: 'boolean' },

                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }
}
