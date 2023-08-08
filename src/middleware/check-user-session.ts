import _ from 'lodash';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { EStatuses, ESystemLoggerFlags } from '../enums';
import {
    loggerHelper,
    jwtHelper
} from "../helpers";
import { User } from '../models/';
import { errorCodes } from '../error-codes';
import { verboseMode } from '../constants';

export default async (
    req: Request,
    res: Response,
    next: NextFunction

) => {
    const userAccessToken =
        req.header('user-access-token') ||
        req.query.userAccessToken; // for LMS fetch-lecture-source 206 API

    if (
        !userAccessToken ||
        !_.isString(userAccessToken)

    ) {
        next(errorCodes.AccessDenied);

        await loggerHelper.accessLogger(
            req,
            EStatuses.Unauthorized
        );
        return;
    }

    try {
        const userSessionSecret = process.env.USER_SESSION_SECRET;

        if (!userSessionSecret) {
            return next(errorCodes.ProblemWithProcessing);
        }
        const {
            data: tokenData

        } = jwtHelper.decodeToken(
            userAccessToken,
            userSessionSecret

        ) as JwtPayload;

        if (tokenData?.user_id) {
            const user = await User
                .query()
                .findOne(
                    {
                        id: tokenData.user_id
                    }

                ).modify('available');

            if (!user) {
                loggerHelper.systemLogger(
                    {
                        message: 'Unauthorized Access',
                        service: 'user session middleware',
                        type: ESystemLoggerFlags.Access
                    }
                );
                next(errorCodes.AccessDenied);

                await loggerHelper.accessLogger(
                    req,
                    EStatuses.Unauthorized
                );
                return;

            } else if (
                user.status ===
                EStatuses.Blocked

            ) {
                return next(errorCodes.UserBlocked);
            }

            if (verboseMode) {
                loggerHelper.systemLogger(
                    {
                        message: `Granted: user ${user.id
                            }; route: ${req.originalUrl}`,
                        service: 'user session middleware',
                        type: ESystemLoggerFlags.Debug
                    }
                )
            }
            
            req.user = user;

            next();

            await loggerHelper.accessLogger(
                req,
                EStatuses.General,
                user.id,
            );

        } else {
            loggerHelper.systemLogger(
                {
                    message: 'Unauthorized Access',
                    service: 'user session middleware',
                    type: ESystemLoggerFlags.Access
                }
            );
            next(errorCodes.AccessDenied);

            await loggerHelper.accessLogger(
                req,
                EStatuses.Unauthorized
            );

            return;
        }

    } catch (err) {
        return next(err);
    }
}
