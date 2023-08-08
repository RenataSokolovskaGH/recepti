import { Request } from "express";
import {
    ISensitiveApiStruct,
    IIncomingClientConfig,
    IAssignAndAnalyzeFailedLoginAttemptParams,
    IResolveFailedLoginAttemptParams,
    IDetermineUserKnownSessionParams,
    IDetermineUserKnownSessionState,
    IKnownUserSessionParams,
    IInsertNewUserSessionParams
} from "../interfaces";
import { dbModels } from "../db/db-models";
import {
    generatorHelper,
    jwtHelper,
    loggerHelper,
    resolverHelper,
} from "../helpers";
import {
    AccessLog,
    BlockedSources,
    Credentials,
    KnownUsersSessions,
    User,
    UsersSessions
} from "../models";
import { EStatuses, ESystemLoggerFlags, EUserActivityType } from "../enums";
import { AuthLoginResponseSkeleton } from "../skeleton/api/responses/auth.responses.skeleton";
import { FailedLoginAttempts, BannedUserLogin } from "../models/";
import { routeConstants } from "../routes/definition";
import { userConstants, verboseMode } from "../constants";
import { errorCodes } from "../error-codes";
import { commonController } from ".";
import { APISuccessResponseSkeleton } from "../skeleton/api/responses/common.responses.skeleton";

class AuthCtl {
    static sensitiveApis: Map<string, ISensitiveApiStruct> = new Map();

    private bruteforceLogStopped = false;

    async blockSource(
        req: Request,

    ): Promise<void> {
        const client = {
            ip: resolverHelper.getClientIP(req),
            ua: req.get('user-agent')
        }

        const existingRecord = await BlockedSources
            .query()
            .findOne(
                {
                    ip: client.ip
                }
            )
            .where(
                'created_at',
                '>=',
                commonController.adjustDBDateFormat(new Date(
                    Date.now() - routeConstants.defaultInvalidRequestTimeout
                ))
            )

        if (!existingRecord) {
            await BlockedSources
                .query()
                .insert(
                    {
                        ip: client.ip,
                        user_agent: client.ua?.substring(
                            0,
                            dbModels.blockedSources.length.userAgent
                        )
                    }
                )

            if (verboseMode) {
                loggerHelper.systemLogger(
                    {
                        message: `Client blocked => [ip: ${client.ip
                            }, last visited route: ${req.originalUrl}]`,
                        service: 'auth: blockSource',
                        type: ESystemLoggerFlags.Debug
                    }
                )
            }
        }
    }

    async checkSuspiciousRequest(
        req: Request

    ): Promise<void> {
        const client: IIncomingClientConfig = {
            ip: resolverHelper.getClientIP(req)
        }

        const [{ invalidRequestCount }] = await AccessLog
            .query()
            .where(
                {
                    ip: client.ip,
                    status: EStatuses.NotFound,
                    action_taken: false
                }

            ).where(
                'created_at',
                '>=',
                commonController.adjustDBDateFormat(new Date(
                    Date.now() - routeConstants.defaultInvalidRequestTimeout

                ))

            ).count('id as invalidRequestCount');

        if (
            invalidRequestCount >=
            routeConstants.defaultInvalidRequestBlockThreshold

        ) {
            await this.blockSource(
                req
            );

            await AccessLog
                .query()
                .where(
                    {
                        ip: client.ip,
                        status: EStatuses.NotFound,
                        action_taken: false
                    }

                ).patch(
                    {
                        action_taken: true
                    }
                )
        }
    }

    async isSourceBlocked(
        req: Request,
        reason?: string

    ): Promise<boolean> {
        const client = {
            ip: resolverHelper.getClientIP(req)
        }

        return !!await BlockedSources
            .query()
            .findOne(
                {
                    ip: client.ip,
                    reason
                }

            ).where(
                'created_at',
                '>=',
                commonController.adjustDBDateFormat(new Date(
                    Date.now() -
                    routeConstants.defaultInvalidRequestTimeout

                ))

            ).skipUndefined();
    }

    verifySensitiveApi(
        originalUrl: string

    ): string | null {
        if (!AuthCtl.sensitiveApis.size) {
            loggerHelper.systemLogger(
                {
                    message: 'Sensitive APIs not assigned',
                    service: 'isSensitiveApi',
                    type: ESystemLoggerFlags.Warn
                }
            )

            return null;
        }

        for (const sensApiId of AuthCtl.sensitiveApis.keys()) {
            if (
                new RegExp(`.*${sensApiId}.*`)
                    .test(originalUrl)

            ) {
                return sensApiId;
            }
        }

        return null;
    }

    assignSensitiveApis(
        sensitiveApis: Map<string, ISensitiveApiStruct>

    ): void {
        AuthCtl.sensitiveApis = sensitiveApis;

        if (verboseMode) {
            loggerHelper.systemLogger(
                {
                    message: `APIs assigned. Size #${AuthCtl.sensitiveApis.size}`,
                    service: 'assignSensitiveApis',
                    type: ESystemLoggerFlags.Debug
                }
            )
        }
    }

    async isSensitiveApiVacancyExceeded(
        sensApiId: string

    ): Promise<boolean> {
        const sensApiStruct = AuthCtl.sensitiveApis.get(
            sensApiId
        )

        if (!sensApiStruct) {
            loggerHelper.systemLogger(
                {
                    message: `Failed to extract sensitive API struct. Id: ${sensApiId}`,
                    service: 'isSensitiveApiVacancyExceeded',
                    type: ESystemLoggerFlags.Error
                }
            )

            return false;
        }

        const [{ routeVacancy }] = await AccessLog
            .query()
            .where(
                'route',
                'like',
                `%${sensApiId}%`
            )
            .where(
                'created_at',
                '>=',
                commonController.adjustDBDateFormat(new Date(
                    Date.now() -
                    sensApiStruct.vacancyPeriodSec * 1000

                ))

            )
            .count('id as routeVacancy');

        if (
            routeVacancy >=
            sensApiStruct.hitCountThreshold

        ) {
            if (
                verboseMode &&
                !this.bruteforceLogStopped

            ) {
                loggerHelper.systemLogger(
                    {
                        message: `Dropped. API: ~/${sensApiId.split('/').pop()
                            }. Threshold: #${sensApiStruct.hitCountThreshold}`,

                        service: 'bruteforce-prevention',
                        type: ESystemLoggerFlags.Access
                    }
                )
            }

            this.bruteforceLogStopped = true;

            return true;
        }

        if (this.bruteforceLogStopped) {
            this.bruteforceLogStopped = false;
        }

        return false;
    }

    private async assignAndAnalyzeFailedLoginAttempt(
        params: IAssignAndAnalyzeFailedLoginAttemptParams

    ): Promise<void> {
        const statusValidUserName =
            params.status ===
            EStatuses.ValidUserName;
        const statusInValidUserName =
            params.status ===
            EStatuses.InvalidUserName;
        if (
            !params.userName &&
            statusValidUserName

        ) {
            return;
        }

        await FailedLoginAttempts
            .query()
            .insert(
                {
                    client_ip: params.clientIp,
                    user_name: params.userName,
                    status: params.status
                }
            )
            .skipUndefined();

        const [{ maxAllowedLoginThreshold }] =
            await FailedLoginAttempts
                .query()
                .where(
                    {
                        status: params.status,

                        client_ip: statusInValidUserName
                            ? params.clientIp
                            : undefined,

                        user_name: statusValidUserName
                            ? params.userName
                            : undefined,
                    }
                )
                .modify('unresolved')
                .skipUndefined()
                .count(
                    'id as maxAllowedLoginThreshold'
                )

        if (!maxAllowedLoginThreshold) {
            return;
        }

        if (
            statusInValidUserName &&
            maxAllowedLoginThreshold >=
            userConstants.failedLoginAttempts.invalidUserNameLoginThreshold

        ) {
            if (!params.req) {
                return;
            }

            await this.blockSource(
                params.req
            )

            await this.resolveFailedLoginAttempts(
                {
                    status: params.status,
                    clientIp: params.clientIp
                }
            )

        } else if (
            statusValidUserName &&
            maxAllowedLoginThreshold >=
            userConstants.failedLoginAttempts.validUserName.warningThreshold

        ) {
            const existingUserBan = await this.getExistingLoginBan(
                params.userName
            )

            if (!existingUserBan) {
                await BannedUserLogin
                    .query()
                    .insert(
                        {
                            user_name: params.userName,
                            expired_at: commonController.adjustDBDateFormat(new Date(
                                Date.now() +
                                userConstants.failedLoginAttempts.validUserName.warningBanPeriodInSec * 1000
                            ))
                        }
                    )

                if (params.user) {
                    await loggerHelper.logUserActivity(
                        {
                            userId: params.user.id,
                            activityType: EUserActivityType.UserTemporaryBlockedLogin,
                            metadata: {
                                clientIp: params.clientIp
                            }
                        }
                    )
                }

                await this.resolveFailedLoginAttempts(
                    {
                        status: params.status,
                        userName: params.userName
                    }
                )
            }

            throw errorCodes.UserAccountBanned;
        }
    }

    private async getExistingLoginBan(
        userName: string | undefined

    ): Promise<BannedUserLogin | undefined> {
        if (!userName) {
            return undefined;
        }

        return BannedUserLogin
            .query()
            .findOne(
                {
                    user_name: userName
                }
            )
            .modify('valid');
    }


    private async resolveFailedLoginAttempts(
        params: IResolveFailedLoginAttemptParams

    ): Promise<void> {
        await FailedLoginAttempts
            .query()
            .where(
                {
                    client_ip: params.clientIp,
                    user_name: params.userName,
                    status: params.status
                }
            )
            .modify('unresolved')
            .skipUndefined()
            .patch(
                {
                    resolved: true
                }
            )
    }

    async validateCredentials(
        user: User,
        password: string

    ): Promise<boolean> {
        const creds = await Credentials
            .query()
            .findOne(
                {
                    user_id: user.id
                }
            )

        if (!creds) {
            return false;
        }
        const clientPass = generatorHelper.encryptPassword(
            password,
            creds?.salt
        );

        return creds.hash ===
            clientPass.hash;
    }

    async login(
        req: Request,

    ): Promise<AuthLoginResponseSkeleton> {
        const userSessionSecret = process.env.USER_SESSION_SECRET;

        if (!userSessionSecret) {
            throw errorCodes.ProblemWithProcessing;
        }

        const {
            userName,
            password

        } = req.body;

        const client: IIncomingClientConfig = {
            ip: resolverHelper.getClientIP(req),
            ua: req.get('user-agent'),
            browser: req.useragent?.browser,
            os: req.useragent?.os,
            platform: req.useragent?.platform,
            version: req.useragent?.version,
        }

        const formattedUserName = userName
            .trim()
            .toLowerCase();

        const user = await User
            .query()
            .findOne(
                {
                    user_name: formattedUserName
                }
            ).modify('available');

        if (!user?.id) {
            await this.assignAndAnalyzeFailedLoginAttempt(
                {
                    req,
                    clientIp: client.ip,
                    userName: formattedUserName,
                    status: EStatuses.InvalidUserName
                }
            )

            throw errorCodes.InvalidCredentials;
        }

        if (
            await this.getExistingLoginBan(
                formattedUserName
            )

        ) {
            throw errorCodes.UserAccountBanned;
        }

        if (
            !await this.validateCredentials(
                user,
                password
            )

        ) {
            await this.assignAndAnalyzeFailedLoginAttempt(
                {
                    clientIp: client.ip,
                    userName: formattedUserName,
                    status: EStatuses.ValidUserName
                }
            )

            await loggerHelper.logUserActivity(
                {
                    userId: user.id,
                    activityType: EUserActivityType.UnsuccessfulLogin,
                    metadata: null
                }
            )

            throw errorCodes.InvalidCredentials;
        }

        if (
            user.status ===
            EStatuses.Blocked

        ) {
            throw errorCodes.UserBlocked;
        }

        await this.resolveFailedLoginAttempts(
            {
                status: EStatuses.ValidUserName
            }
        )

        const {
            knownSession,

        } = await this.determineUserKnownSessionState(
            {
                client,
                req,
                user
            }
        )

        const userAccessToken = await jwtHelper.generateToken(
            {
                user_id: user.id
            },
            userSessionSecret
        );

        await this.insertNewUserLoginSession(
            {
                knownSessionId: knownSession.id,
                req,
                user,
                userAccessToken
            }
        )

        await loggerHelper.logUserActivity(
            {
                userId: user.id,
                activityType: EUserActivityType.LoggedIn,
                metadata: {
                    knownSessionId: knownSession.id
                }
            }
        )

        return {
            userAccessToken,
            accountType: user.account_type
        }
    }

    private async insertNewUserLoginSession(
        params: IInsertNewUserSessionParams

    ): Promise<void> {
        const trx = await UsersSessions.startTransaction(),
            expiredAt = commonController.adjustDBDateFormat(new Date(
                Date.now() +
                userConstants.userSessionTokenExpiresIn
            ))

        try {
            await UsersSessions
                .query(trx)
                .insert(
                    {
                        user_id: params.user.id,
                        access_token: params.userAccessToken,
                        expired_at: expiredAt,
                        known_session_id: params.knownSessionId,
                    }

                ).onConflict()
                .skipUndefined()
                .merge(
                    {
                        expired_at: expiredAt,
                        status: EStatuses.Active
                    }
                )

            await UsersSessions
                .query(trx)
                .where(
                    {
                        user_id: params.user.id,
                        status: EStatuses.Active
                    }

                ).whereNot(
                    'access_token',
                    params.userAccessToken
                )
                .patch(
                    {
                        status: EStatuses.Expired
                    }
                )

            await trx.commit();

        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }


    async getUserKnownSession(
        params: IKnownUserSessionParams

    ): Promise<KnownUsersSessions | undefined> {
        if (
            (
                !params.knownSessionId ||
                !params.userId
            )
            &&
            (
                !params.ipAddress ||
                !params.userAgent
            )

        ) {
            return undefined;
        }

        return KnownUsersSessions
            .query()
            .findOne(
                {
                    id: params.knownSessionId,
                    user_agent: params.userAgent?.substring(
                        0,
                        255
                    ),
                    ip: params.ipAddress,
                    user_id: params.userId
                }

            ).skipUndefined();
    }


    private async determineUserKnownSessionState(
        params: IDetermineUserKnownSessionParams

    ): Promise<IDetermineUserKnownSessionState> {
        let knownSession = await this.getUserKnownSession(
            {
                userId: params.user.id,
                userAgent: params.client.ua,
                ipAddress: params.client.ip
            }
        )

        if (
            !knownSession
        ) {
            knownSession = await KnownUsersSessions
                .query()
                .insertAndFetch(
                    {
                        ip: params.client.ip,
                        user_agent: params.client.ua,
                        user_id: params.user.id,
                        os: params.client.os,
                        browser: params.client.browser,
                        version: params.client.version,
                        platform: params.client.platform,
                    }
                )
        }
        return {
            knownSession
        }
    }

    async logout(
        user: User,
        userActiveSession: UsersSessions,

    ): Promise<APISuccessResponseSkeleton> {

        if (
            userActiveSession?.known_session_id &&
            await this.deleteUserKnownSession(
                user.id,
                userActiveSession.known_session_id,
            )

        ) {
            await userActiveSession.
                $query()
                .delete();
        }

        await loggerHelper.logUserActivity(
            {
                userId: user.id,
                activityType: EUserActivityType.LoggedOut,
                metadata: {
                    userActiveSessionId: userActiveSession?.id
                }
            }
        )

        return errorCodes.Success;
    }

    async deleteUserKnownSession(
        userId: number,
        knownSessionId: number,

    ): Promise<boolean> {
        const knownSession = await this.getUserKnownSession(
            {
                userId,
                knownSessionId
            }
        )
        if (!knownSession) {
            return false;
        }

        await knownSession.$query().delete();
        return true;
    }

}

const instance = new AuthCtl();

export {
    instance,
    AuthCtl
}
