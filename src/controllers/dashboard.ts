import { errorCodes } from "../error-codes";
import { IGetRecipesParams, RGetRecipeDetails, RGetRecipes } from "../interfaces";
import { MatchingRecipes, Recipes } from "../models";

class DashboardCtl {
    public async getRecipes(
        {
            calories,
            dietFlag,
            ingredients,
            isSweet,
            name
        }: Partial<IGetRecipesParams>

    ): Promise<RGetRecipes> {
        const myRecipes = await Recipes
            .query()
            .where(
                q => {
                    if (name) {
                        q.where(
                            "name",
                            'like',
                            `%${name}%`
                        )
                    }

                    if (
                        calories &&
                        calories > 0
                    ) {
                        q.where(
                            "calories",
                            '<=',
                            calories
                        )
                    }

                    if (ingredients?.length) {
                        q.where(
                            x => {
                                for (const ing of ingredients.split(',')) {
                                    x.orWhere(
                                        'ingredients',
                                        'like',
                                        `%${ing.trim()}%`
                                    )
                                }
                            }
                        )
                    }

                    if (dietFlag) {
                        q.where(
                            "diet_flag",
                            'like',
                            dietFlag
                        )
                    }

                    if (
                        isSweet !==
                        undefined
                    ) {
                        q.where(
                            "is_sweet",
                            !!isSweet
                        )
                    }
                }
            )
            .orderBy(
                "calories",
                "desc"
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

        const matchingRecipes = await MatchingRecipes
            .query()
            .withGraphJoined('recipe')
            .where(
                'recipe_id',
                recipeId
            )
            .orderBy(
                "calories",
                "desc"
            )

        return {
            recipeDetails: myRecipe.recipeDetailsSchema(),
            
            matchingRecipes:
                matchingRecipes
                    .filter(q => !!q.recipe)
                    .map(q => q.recipe!.recipeSchema())
        }
    }
}

const dashCtl = new DashboardCtl();

export {
    dashCtl
}
