import { ISensitiveApiStruct } from "../interfaces";

const getAllRoutes = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: Record<string, any>

) => {
    const niz: string[] = [];

    Object.values(obj).forEach(
        val => typeof val === "object"
            ? niz.push(
                ...getAllRoutes(val)
            )
            : niz.push(
                val
            )
    );
    return niz;
}

const apiRoute = process.env.API_URI || '/api';
const defaultDomain = process.env.DEFAULT_DOMAIN;
const proxyRoute = process.env.PROXY_URI || '';
const staticRoute = process.env.STATIC_URI || '/static';

const routes = {
    root: '/',
    apiRoute,
    swaggerURI: '/__swagger',
    static: {
        root: `${staticRoute}/*`,
        collect: `${staticRoute}/collect`,
    },
    auth: {
        login: `${apiRoute}/auth/login`,
    },
    dashboard: {
        root: `${apiRoute}/dashboard/*`,
        user: {
            root: `${apiRoute}/dashboard/user/*`,
            changeUserPassword: `${apiRoute}/dashboard/user/change-user-password`,
            getUserProfile: `${apiRoute}/dashboard/user/get-user-profile`,
            editUserProfile: `${apiRoute}/dashboard/user/edit-user-profile`,
            setProfileAvatar: `${apiRoute}/dashboard/user/set-profile-avatar`,
            removeProfileAvatar: `${apiRoute}/dashboard/user/remove-profile-avatar`,
            logout: `${apiRoute}/dashboard/user/logout`,
        }
    }


};
const sensitiveApis: Map<string, ISensitiveApiStruct> = new Map(
    [
        [
            routes.auth.login,
            {
                hitCountThreshold: 100,
                vacancyPeriodSec: 60
            }
        ]
    ]
)
const defaultInvalidRequestTimeout = 86400 * 1000;
const defaultInvalidRequestBlockThreshold = 2;

export const routeConstants = {
    routes,
    getAllRoutes,
    defaultDomain,
    defaultInvalidRequestTimeout,
    defaultInvalidRequestBlockThreshold,
    proxyRoute,
    sensitiveApis
}