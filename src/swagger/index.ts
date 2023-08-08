import swaggerUi, { JsonObject, SwaggerUiOptions } from 'swagger-ui-express';
import digitalLawSwaggerDoc from '../swagger/api-doc.json';

const swaggerDoc: JsonObject | undefined = digitalLawSwaggerDoc;

export {
    swaggerUi,
    swaggerDoc,
    SwaggerUiOptions
}
