import { Request } from 'express';
import formidable from 'formidable';
import { IFileFieldsSchema } from '../interfaces';

class ResolverHelper {
    getClientIP(
        req: Request

    ): string {
        return req.headers['x-forwarded-for']?.toString() ||
            req.socket.remoteAddress || '';
    }

    getDayCount(
        startDate?: Date

    ): number {
        if (!startDate) {
            return 0;
        }
        return Math.round((Date.now() - startDate.getTime()) / (24 * 3600 * 1000)) || 0;
    }

    async resolveIncomingForm(
        req: Request

    ): Promise<IFileFieldsSchema> {
        const form = new formidable.IncomingForm(
            {
                multiples: true,
                keepExtensions: true
            }
        )
        const parsedForm: IFileFieldsSchema = await new Promise(
            resolve => {
                form.parse(
                    req,
                    (err, fields, files) => {
                        resolve(
                            {
                                fields,
                                files
                            }
                        );
                    }
                );
            }
        );

        return parsedForm;
    }
}

const instance = new ResolverHelper();

export {
    instance,
    ResolverHelper
} 
