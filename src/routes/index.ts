import Router from 'express';

import { serverHelper } from '../helpers';
import { routeConstants } from './definition';
import { errorCodes } from '../error-codes';
import basicAuth from 'src/middleware/basic-auth';

const router = Router();

serverHelper.initializeSwaggerModule(
    {
        basicAuth,
        router,
        swaggerUri: routeConstants.routes.swaggerURI,
        customSiteTitle: "Project Name"
    }
)

// Health check
router.get(routeConstants.routes.root, (req, res) => res.send(errorCodes.Success));


export {
    router
}
