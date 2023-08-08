import Router from 'express';

import {
    basicAuth,
    checkUserSession,
    checkUserUniqueAccess,
    logRequest
} from '../middleware/';
import user from './user'

import { serverHelper } from '../helpers';
import { routeConstants } from './definition';
import { errorCodes } from '../error-codes';

const router = Router();

serverHelper.initializeSwaggerModule(
    {
        basicAuth,
        router,
        swaggerUri: routeConstants.routes.swaggerURI,
        customSiteTitle: "Project Name"
    }
)

const requireChecks = {
    user: [
        checkUserSession,
        checkUserUniqueAccess
    ],
    admin: [
        checkUserSession,
        checkUserUniqueAccess
    ]
}

router.use(
    routeConstants.routes.auth.login,
    logRequest
)

router.use(routeConstants.routes.dashboard.root, requireChecks.user);

// Health check
router.get(routeConstants.routes.root, (req, res) => res.send(errorCodes.Success));

// Auth
router.post(routeConstants.routes.auth.login, user.login);

//user
router.post(routeConstants.routes.dashboard.user.changeUserPassword, user.changeUserPassword);
router.get(routeConstants.routes.dashboard.user.getUserProfile, user.getUserProfile);
router.post(routeConstants.routes.dashboard.user.editUserProfile, user.editUserProfile);
router.post(routeConstants.routes.dashboard.user.setProfileAvatar, user.setProfileAvatar);
router.post(routeConstants.routes.dashboard.user.removeProfileAvatar, user.removeProfileAvatar);
router.post(routeConstants.routes.dashboard.user.logout, user.logout);

export {
    router
}
