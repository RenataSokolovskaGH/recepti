import { Fields, Files } from "formidable";
import { EStatuses, ESystemLoggerFlags, EUserAccountType, EUserActivityType } from './enums';
import { Express, Router, RequestHandler, Request } from 'express';
import { KnownUsersSessions, User } from "./models";
import { Transaction } from "objection";
import { TAlterDBCandidate } from "./types";
import { Knex } from "knex";

export interface IColumnUpdateParams {
    callback: (t: Knex.CreateTableBuilder) => any;
    updateAlways?: boolean;
}

export interface IAlterDBColumnParams {
    knex: Knex,
    alterCandidates: TAlterDBCandidate,
    tableName: string;
}

export interface IInitializeSwaggerModuleParams {
    router: Router;
    swaggerUri: string,
    basicAuth: RequestHandler;
    customSiteTitle?: string;
    swaggerImportPath?: string;
}

export interface ISensitiveApiStruct {
    vacancyPeriodSec: number;
    hitCountThreshold: number;
}

export interface IFileTypeWhiteListSpecificStruct {
    token: string;
    preview: boolean;
    ending: string;
}

export interface IProxiedRoute {
    proxied: boolean;
    proxyRoute?: string;
}

export interface IVerifyFileUrlAbsoluteParams extends IProxiedRoute {
    fileUrl: string
}

export interface ITransformAvatarSchemaUrlParams extends IProxiedRoute {
    avatarSchema?: IAvatarSchema | null;
}

export interface IAvatarSchema {
    avatarUrl: string | null;
    thumbnailUrl: string | null;
}

export interface IFileFieldsSchema {
    files: Files;
    fields: Fields;
}

export interface IIncomingClientConfig {
    ip: string
    ua?: string;
    browser?: string;
    os?: string;
    platform?: string;
    version?: string;
    route?: string;
}

export interface IPaginationInput {
    pageIndex: number;
    pageSize: number;
}

export interface IObjectifySystemErrorParams {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
    service: string,
    type?: ESystemLoggerFlags;
    includeSeparator?: boolean;
}

export interface ISystemLoggerParams extends IObjectifySystemErrorParams {
    clientId?: string;
}

export interface IAPIErrorSchema {
    title: string,
    message: string,
    code: string
}

export interface IResolveFailedLoginAttemptParams {
    clientIp?: string;
    userName?: string;
    status: EStatuses;
}

export interface IEditUserProfile {
    userId: number
    firstName: string;
    lastName: string;
    jobTitle: string;
}

export interface ICreateServerInstanceParams {
    app: Express;
    port: number;
    swaggerURI?: string;
    environment: string | undefined;
}

export interface IAssignAndAnalyzeFailedLoginAttemptParams {
    req?: Request;
    clientIp: string;
    userName?: string;
    status: EStatuses;
    user?: User;
}

export interface IKnownUserSessionParams {
    userId: number,
    knownSessionId?: number | null,
    mustBeVerified?: boolean,
    userAgent?: string,
    ipAddress?: string,
}

export interface IDetermineUserKnownSessionParams {
    user: User;
    client: IIncomingClientConfig;
    req: Request;
}

export interface IDetermineUserKnownSessionState {
    knownSession: KnownUsersSessions;
}

export interface ILogUserActivityParams {
    userId: number;
    activityType: EUserActivityType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any> | null;
}

export interface IInsertNewUserSessionParams {
    req: Request;
    user: User;
    userAccessToken: string;
    knownSessionId: number;
}

export interface IUserInputSchema {
    userName: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
    password: string;
    accountType: EUserAccountType;
}

export interface IAdminInsertNewUser extends IUserInputSchema {
    hash: string;
    salt: string;
}

export interface IExternalTrx {
    externalTrx: Transaction;
}

export interface ISpaceDeleteFileParams {
    userId?: number;
    staticFileUrl?: string;
    fileId?: number;
}

export interface IAvatarSavingParams {
    newfileDir: string;
    newFileHash?: string;
    fileType: string | null;
    oldfilePath: string;
    needThumbnail?: boolean;
    userId?: number;
    fileSize?: number;
    generateUrlWithDomain: boolean;
}

export interface ISaveFileToSpaceSchema {
    localFileUrl: string;
    localFilePath: string;
    localFileId: number;
}

export interface IInsertNewSpaceFileParams extends ISpaceFileSavingParams {
    fileChecksum: string;
    fullFilePath?: string;
}

export interface IGetUniqueFileNameParams {
    fileDir: string;
    fileName: string;
}

export interface IResizeLocalImageParams {
    imageFile: string;
    outFilePath: string;
    outFileName: string;
}

export interface IWriteFileFromBufferParams {
    checksum: string;
    fileSize: number;
}

export interface IGenerateStaticFileUrlParams extends IProxiedRoute {
    fileHash: string;
    fileType: string;
    includeDomain: boolean;
}

export interface ISpaceFileSavingParams extends IAvatarSavingParams {
    fileName?: string | null,
}
