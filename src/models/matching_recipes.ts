import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';

export class MatchingRecipes extends Model {
    id: number;
    recipes_id: number;
    matching_recipes_id: number;
   

    created_at: string;
    updated_at: string;


    static get tableName() {
        return dbModels.matchingRecipes.tableName;
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                recipes_id: { type: 'integer' },
                matching_recipes_id: { type: 'integer' },

                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }
}
