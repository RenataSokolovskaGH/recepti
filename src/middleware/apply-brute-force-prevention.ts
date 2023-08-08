import { NextFunction, Request, Response } from 'express';
import { authController } from '../controllers';

export default async (
    req: Request,
    res: Response,
    next: NextFunction

) => {
    try {
        const potentSensitiveApi = authController.verifySensitiveApi(
            req.originalUrl
        )

        if (!potentSensitiveApi) {
            return next();
        }

        if (
            await authController.isSensitiveApiVacancyExceeded(
                potentSensitiveApi
            )

        ) {
            return res.end();
        }

        next();

    } catch (err) {
        next(err);
    }
}
