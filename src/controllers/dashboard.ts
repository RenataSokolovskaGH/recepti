import { errorCodes } from "../error-codes";
import { IGetRecipesParams, RGetRecipeDetails, RGetRecipes } from "../interfaces";
import { Recipes } from "../models";

class DashboardCtl {
    public async getRecipes(
        {
            calories,
            dietFlag,
            ingredients,
            isSweet,
            name
        }: IGetRecipesParams

    ): Promise<RGetRecipes> {
        const parsedIngredients = ingredients.split(',');

        const myRecipes = await Recipes
            .query()
            .where(
                "name",
                'like',
                name
            )
            .where(
                "calories",
                '<=',
                calories
            )
            .where(
                q => {
                    for (const ing of parsedIngredients) {
                        q.where(
                            'ingredients',
                            'like',
                            ing.trim()
                        )
                    }
                }
            )
            .where(
                "diet_flag",
                'like',
                dietFlag
            )
            .where(
                "is_sweet",
                isSweet
            )

        return {
            recipes: myRecipes.map(q => q.recipeSchema())
        }
    }

    public async getRecipeDetails(
        recipeId: number

    ): Promise<RGetRecipeDetails> {
        const myRecipe = await Recipes
            .query()
            .findOne(
                {
                    id: recipeId
                }
            )

        if (!myRecipe) {
            throw errorCodes.InvalidRecipe;
        }

        return {
            recipeDetails: myRecipe.recipeDetailsSchema()
        }
    }
}

const dashCtl = new DashboardCtl();

export {
    dashCtl
}
