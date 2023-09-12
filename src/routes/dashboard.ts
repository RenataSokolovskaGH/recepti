import { NextFunction, Request, Response } from "express";
import { dashCtl } from "../controllers";

export default {
    getRecipes: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            const {
                name,
                calories,
                dietFlag,
                isSweet,
                ingredients

            } = req.body;

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
    }
}