import { authController } from "../controllers";
import { NextFunction, Request, Response } from 'express';
import { sourceBlockingEnabled } from "../constants";
import { errorCodes } from "../error-codes";

export default async (
    req: Request,
    res: Response,
    next: NextFunction

) => {

    try {
        if (!sourceBlockingEnabled) {
            return next();
        }

        await authController.checkSuspiciousRequest(req);

        if (await authController.isSourceBlocked(req)) {
            res.status(403).json(
                errorCodes.AccessDenied
            );

        } else {
            next();
        }

    } catch (err) {
        next(err);
    }
}
