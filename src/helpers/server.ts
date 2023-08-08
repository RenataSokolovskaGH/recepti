import express, { Express, NextFunction, Request, Response } from 'express';
import http from 'http';
import { Model } from 'objection';
import { Knex } from 'knex';
import userAgent from 'express-useragent';
import compression from 'compression';
import cors from 'cors';
import { loggerHelper, storageHelper } from '.';
import { join } from 'path';
import {
    EStatuses,
    ESystemEnv,
    ESystemLoggerFlags
} from '../enums';
import {
    IAPIErrorSchema,
    ICreateServerInstanceParams,
    IInitializeSwaggerModuleParams
} from '../interfaces';
import { errorCodes } from '../error-codes';
import { sysEnvironment, verboseMode } from '../constants';

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
                            loggerHelper.systemLogger(
                                {
                                    message: `DB connection established. ${JSON.stringify(
                                        version[0][0]

                                    )}`,
                                    service: 'knex'
                                }
                            )

                            resolve();
                        }
                    )
                    .catch(
                        err => {
                            loggerHelper.objectifySystemError(
                                {
                                    message: err,
                                    service: 'knex',
                                    type: ESystemLoggerFlags.Error
                                }
                            )

                            knex.destroy();

                            reject();
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
            express.json()
        )
        app.use(
            compression()
        );
        app.use(
            cors()
        );
        app.use(
            userAgent.express()
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

                    loggerHelper.accessLogger(
                        req,
                        EStatuses.NotFound
                    );

                } else {
                    let {
                        title,
                        message,
                        // eslint-disable-next-line prefer-const
                        code = '255'

                    } = error;

                    if ([
                        ESystemEnv.Production.toString(),
                        ESystemEnv.Prem

                    ].includes(sysEnvironment)

                    ) {
                        if (code === '255') {
                            title = 'Internal server error';
                            message = 'Concealed';
                        }
                    }

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
            basicAuth,
            customSiteTitle = "Digital Law Staging Swagger",
            router,
            swaggerUri,
            swaggerImportPath = 'dist/src/swagger'

        }: IInitializeSwaggerModuleParams

    ): void {
        const isSwaggerOn = sysEnvironment !==
            ESystemEnv.Prem && process.env.IS_SWAGGER_ENABLE?.toLocaleLowerCase() ===
            'true';

        if (isSwaggerOn) {
            try {
                swaggerImportPath = join(
                    process.cwd(),
                    swaggerImportPath
                )

                if (verboseMode) {
                    loggerHelper.systemLogger(
                        {
                            message: `Swagger import path: ${swaggerImportPath}`,
                            service: 'swaggerInit',
                            type: ESystemLoggerFlags.Debug
                        }
                    )
                }

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
                    basicAuth,
                    swaggerUi.serve,
                    swaggerUi.setup(
                        swaggerDoc,
                        swaggerOptions
                    )
                )

            } catch (err) {
                loggerHelper.systemLogger(
                    {
                        message: 'Failed to initiate Swagger module',
                        service: 'swaggerInit',
                        type: ESystemLoggerFlags.Fatal,
                        includeSeparator: true
                    }
                )
            }
        }
    }

    createServerInstance(
        {
            app,
            port,
            swaggerURI,
            environment

        }: ICreateServerInstanceParams

    ): http.Server {
        storageHelper.clearTempFolder();

        return http
            .createServer(app)
            .listen(
                port,
                'localhost',
                () => {
                    loggerHelper.systemLogger(
                        {
                            message: `Server listening on: http://localhost:${port}`,
                            service: 'server'
                        }
                    );

                    if (
                        environment ===
                        ESystemEnv.Development

                    ) {
                        loggerHelper.systemLogger(
                            {
                                message: `Swagger Docs runs on http://localhost${port
                                    ? ':' + port
                                    : ''
                                    }${swaggerURI}`,
                                service: 'server'
                            }
                        );
                    }
                }
            )
    }
}

const instance = new ServerHelper();

export {
    instance,
    ServerHelper
} 