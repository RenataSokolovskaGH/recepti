import { JSONSchema, Model, RelationMappings } from 'objection';
import { dbModels } from '../db/db-models';
import { Recipes } from './recipes';

export class MatchingRecipes extends Model {
    id: number;
    recipe_id: number;
    matching_recipe_id: number;

    created_at: string;
    updated_at: string;

    recipe?: Recipes;

    static get tableName() {
        return dbModels.matchingRecipes.tableName;
    }

    static get relationMappings(

    ): RelationMappings {
        return {
            recipe: {
                relation: Model.HasOneRelation,
                modelClass: Recipes,
                join: {
                    from: `${dbModels.matchingRecipes.tableName}.matching_recipe_id`,
                    to: `${dbModels.recipes.tableName}.id`,
                }
            }
        }
    }

    static get jsonSchema(): JSONSchema {
        return {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                recipe_id: { type: 'integer' },
                matching_recipe_id: { type: 'integer' },

                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }
}
