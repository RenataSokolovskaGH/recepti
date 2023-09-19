import { Router, RequestHandler, Express } from 'express';
import { EDietFlag } from './enums';

export interface IInitializeSwaggerModuleParams {
    router: Router;
    swaggerUri: string,
    customSiteTitle?: string;
    swaggerImportPath?: string;
}

export interface IGetRecipesParams {
    name: string;
    calories: number;
    dietFlag: EDietFlag;
    isSweet: boolean;
    ingredients: string;
}

export interface RGetRecipeDetails {
    recipeDetails: IRecipeDetailsSchema;
    matchingRecipes: IRecipeSchema[];
}

export interface IRecipeDetailsSchema extends IRecipeSchema {
    description: string;
    makingProcedure: string;
}

export interface IRecipeSchema extends IGetRecipesParams {
    recipeId: number;
    avatar: string | null;
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
