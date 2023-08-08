import { NextFunction, Request, Response } from 'express';
import { EStatuses, ESystemLoggerFlags } from '../enums';
import { loggerHelper } from "../helpers";

export default async (
    req: Request,
    res: Response,
    next: NextFunction

) => {
    try {
        loggerHelper.accessLogger(
            req,
            EStatuses.General,
            req.user?.id

        ).catch(
            err => loggerHelper.objectifySystemError(
                {
                    message: err,
                    service: 'request-logger',
                    type: ESystemLoggerFlags.Error
                }
            )
        )

        next();

    } catch (err) {
        next(err);
    }
}
