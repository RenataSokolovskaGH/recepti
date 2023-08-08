import _ from 'lodash';
import { NextFunction, Request, Response } from 'express';
import { ESystemLoggerFlags } from '../enums';
import { loggerHelper } from "../helpers/";
import { UsersSessions } from '../models/';
import { errorCodes } from '../error-codes';
import { commonConstants } from '../constants';

export default async (
    req: Request,
    res: Response,
    next: NextFunction

) => {
    const userAccessToken =
        req.header('user-access-token') ||
        req.query.userAccessToken;

    if (
        !userAccessToken ||
        !_.isString(userAccessToken)

    ) {
        return next(errorCodes.AccessDenied);
    }

    try {
        const userActiveSession = await UsersSessions
            .query()
            .findOne(
                {
                    access_token: userAccessToken
                }

            ).modify('active');

        if (!userActiveSession) {
            loggerHelper.systemLogger(
                {
                    message: `User session inactive: ${userAccessToken.substring(
                        userAccessToken.length - commonConstants.sessionTokenCutLength

                    )}`,
                    service: 'user unique access middleware',
                    type: ESystemLoggerFlags.Access
                }
            );

            return next(errorCodes.SessionInactive)
        }
        req.userActiveSession = userActiveSession;

        next();

    } catch (err) {
        return next(err);
    }
}
