import Router from 'express';

import { serverHelper } from '../helpers';
import { routeConstants } from './definition';
import { errorCodes } from '../error-codes';
import dashboard from './dashboard';

const router = Router();

serverHelper.initializeSwaggerModule(
    {
        router,
        swaggerUri: routeConstants.routes.swaggerURI,
        customSiteTitle: "My Ideal Recipe"
    }
)

// Health check
router.get(routeConstants.routes.root, (req, res) => res.send(errorCodes.Success));

router.post(routeConstants.routes.dashboard.getRecipes, dashboard.getRecipes);
router.post(routeConstants.routes.dashboard.getRecipeDetails, dashboard.getRecipeDetails);

export {
    router
}
