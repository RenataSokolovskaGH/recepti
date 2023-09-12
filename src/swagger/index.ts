import swaggerUi, { JsonObject, SwaggerUiOptions } from 'swagger-ui-express';
import apiDoc from '../swagger/api-doc.json';

const swaggerDoc: JsonObject | undefined = apiDoc;

export {
    swaggerUi,
    swaggerDoc,
    SwaggerUiOptions
}
