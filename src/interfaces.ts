import { Router, RequestHandler, Express } from 'express';
import { EDietFlag } from './enums';

export interface IInitializeSwaggerModuleParams {
    router: Router;
    swaggerUri: string,
    customSiteTitle?: string;
    swaggerImportPath?: string;
}

export interface IAvatarSchema {
    avatarUrl: string | null;
    thumbnailUrl: string | null;
}

export interface IGetRecipesParams extends IRecipeSchema { }

export interface IRecipeSchema {
    name: string;
    calories: number;
    dietFlag: EDietFlag;
    isSweet: boolean;
    ingredients: string;
}

export interface RGetRecipes {
    recipes: IRecipeSchema[];
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

export interface ICreateServerInstanceParams {
    app: Express;
    port: number;
    swaggerURI?: string;
}
