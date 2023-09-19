import { NextFunction, Request, Response } from "express";
import { dashCtl } from "../controllers";

export default {
    getRecipes: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            let {
                name,
                calories,
                dietFlag,
                isSweet,
                ingredients

            } = req.body;

            if (!name) {
                name = undefined;
            }

            if (!calories) {
                calories = undefined;
            }

            if (!dietFlag) {
                dietFlag = undefined;
            }

            if (!ingredients) {
                ingredients = undefined;
            }

            const result = await dashCtl.getRecipes(
                {
                    calories,
                    dietFlag,
                    ingredients,
                    isSweet,
                    name
                }
            )
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    getRecipeDetails: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            const {
                recipeId

            } = req.body;

            const result = await dashCtl.getRecipeDetails(
                recipeId
            )
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    }
}