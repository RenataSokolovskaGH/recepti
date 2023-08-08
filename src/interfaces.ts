import { Fields, Files } from "formidable";
import { EStatuses } from './enums';
import { Express, Router, RequestHandler, Request } from 'express';
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
