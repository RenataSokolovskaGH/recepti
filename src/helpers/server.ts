import express, { Express, NextFunction, Request, Response } from 'express';
import http from 'http';
import { Model } from 'objection';
import { Knex } from 'knex';
import compression from 'compression';
import cors from 'cors';
import { join } from 'path';

import {
    IAPIErrorSchema,
    ICreateServerInstanceParams,
    IInitializeSwaggerModuleParams
} from '../interfaces';
import { errorCodes } from '../error-codes';
import { logger } from './logger';

class ServerHelper {
    async createDBConnectionInstance(
        knex: Knex

    ): Promise<void> {
        return new Promise<void>(
            (resolve, reject) => {
                Model.knex(knex);

                knex.raw('select version() as DB_version')
                    .then(
                        version => {
                            logger('DB connection established')
                            return resolve();
                        }
                    )
                    .catch(
                        err => {
                            knex.destroy();

                            reject(err);
                        }
                    );
            }
        )
    }

    attachAuxiliaryMiddleware(
        app: Express

    ): void {
        app.use(
            express.urlencoded(
                {
                    extended: false
                }
            )
        )
        app.use(
            express.json(
                {
                    limit: "30mb"
                }
            ),
        )
        app.use(
            compression()
        );
        app.use(
            cors()
        );       

        app.use(
            '*.html',
            (req, res) => {
                res.redirect(
                    301,
                    '/'
                );
            }
        )
    }

    attachErrorHandler(
        app: Express,
        allRoutes: string[]

    ): void {
        app.use(
            (
                req,
                res,
                next

            ) => next(
                errorCodes.ApiRouteNotFound
            )
        )

        app.use(
            (
                error: IAPIErrorSchema,
                req: Request,
                res: Response,
                next: NextFunction

            ) => {
                if (
                    error.code ===
                    errorCodes.ApiRouteNotFound.code &&
                    !allRoutes.includes(req.url)

                ) {
                    res.send(errorCodes.ApiRouteNotFound);
                    
                } else {
                    let {
                        title,
                        message,
                        // eslint-disable-next-line prefer-const
                        code = '255'

                    } = error;

                    res.status(
                        error.code === '255'
                            ? 500
                            : 400

                    ).json(
                        {
                            title,
                            message,
                            code
                        }
                    )
                }
            }
        )
    }

    initializeSwaggerModule(
        {
            customSiteTitle = "API Swagger",
            router,
            swaggerUri,
            swaggerImportPath = 'dist/src/swagger'

        }: IInitializeSwaggerModuleParams

    ): void {
        try {
            swaggerImportPath = join(
                process.cwd(),
                swaggerImportPath
            )

            const {
                swaggerUi,
                swaggerDoc

                // eslint-disable-next-line @typescript-eslint/no-var-requires
            } = require(
                swaggerImportPath
            )

            const swaggerOptions = {
                customSiteTitle
            }

            router.use(
                swaggerUri,
                swaggerUi.serve,
                swaggerUi.setup(
                    swaggerDoc,
                    swaggerOptions
                )
            )

        } catch (err) { }
    }

    createServerInstance(
        {
            app,
            port,
            swaggerURI

        }: ICreateServerInstanceParams

    ): http.Server {
        return http
            .createServer(app)
            .listen(
                port,
                'localhost',
                () => {
                    logger(`Server listening on: http://localhost:${port}`);

                    logger(
                        `Swagger Docs runs on http://localhost:${port}${swaggerURI}`,
                    );
                }
            )
    }
}

const instance = new ServerHelper();

export {
    instance,
    ServerHelper
} 
