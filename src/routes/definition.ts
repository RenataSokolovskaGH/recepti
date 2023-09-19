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

const apiRoute = '/api';

const routes = {
    root: '/',
    apiRoute,
    swaggerURI: '/__swagger',
    dashboard: {
        getRecipes: `${apiRoute}/dashboard/get-recipes`,
        getRecipeDetails: `${apiRoute}/dashboard/get-recipe-details`
    }
};

export const routeConstants = {
    routes,
    getAllRoutes
}
