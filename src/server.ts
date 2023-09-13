import express from 'express';
import { router } from './routes';
import knex from './db/knex';
import { serverHelper } from './helpers';
import { routeConstants } from './routes/definition';
import { logger } from './helpers/logger';

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
                swaggerURI: routeConstants.routes.swaggerURI
            }
        )

        await serverHelper.createDBConnectionInstance(
            knex
        )

        serverHelper.attachAuxiliaryMiddleware(
            app
        )

        app.use('/', router);

        serverHelper.attachErrorHandler(
            app,
            allRoutes
        )

    } catch (err) {
        logger(err);
    }
}
