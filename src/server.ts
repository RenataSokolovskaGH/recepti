import express from 'express';
import { router } from './routes';
import knex from './db/knex';
import { loggerHelper, serverHelper } from './helpers';
import { checkSourceBlocked, applyBruteforcePrevention } from './middleware/';
import { authController } from './controllers';
import { routeConstants } from './routes/definition';
import { sysEnvironment } from './constants';
import { ESystemLoggerFlags } from './enums';

const allRoutes = routeConstants.getAllRoutes(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routeConstants.routes as Record<string, any>
);

export const bootstrap = async (

): Promise<void> => {
    try {
        const app = express();
        const port = parseInt(process.env.PORT || '3000');

        serverHelper.createServerInstance(
            {
                app,
                port,
                environment: sysEnvironment,
                swaggerURI: routeConstants.routes.swaggerURI
            }
        )

        await serverHelper.createDBConnectionInstance(
            knex
        )


        authController.assignSensitiveApis(
            routeConstants.sensitiveApis
        )

        serverHelper.attachAuxiliaryMiddleware(
            app
        )

        app.use(checkSourceBlocked);

        app.use(applyBruteforcePrevention);

        app.use('/', router);

        serverHelper.attachErrorHandler(
            app,
            allRoutes
        )

    } catch (err) {
        loggerHelper.objectifySystemError(
            {
                message: err,
                service: 'bootstrap',
                type: ESystemLoggerFlags.Fatal,
                includeSeparator: true
            }
        )
    }
}
