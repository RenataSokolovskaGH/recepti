import { JSONSchema, Model } from 'objection';
import { dbModels } from '../db/db-models';
import { EDietFlag } from '../enums';
import { IRecipeDetailsSchema, IRecipeSchema } from '../interfaces';

export class Recipes extends Model {
    id: number;
    name: string;
    ingredients: string;
    avatar: string | null;
    calories: number;
    making_procedure: string;
    diet_flag: EDietFlag;
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
                diet_flag: { type: 'string' },
                calories: { type: 'integer' },
                making_procedure: { type: 'string' },
                avatar: { type: ['string', 'null'] },
                description: { type: 'string' },
                is_sweet: { type: 'boolean' },

                created_at: { type: 'string' },
                updated_at: { type: 'string' }
            }
        };
    }

    recipeSchema(

    ): IRecipeSchema {
        return {
            recipeId: this.id,
            calories: this.calories,
            dietFlag: this.diet_flag,
            ingredients: this.ingredients,
            isSweet: !!this.is_sweet,
            name: this.name,
            avatar: this.avatar
        }
    }

    recipeDetailsSchema(

    ): IRecipeDetailsSchema {
        return {
            ...this.recipeSchema(),
            description: this.description,
            makingProcedure: this.making_procedure
        }
    }
}
