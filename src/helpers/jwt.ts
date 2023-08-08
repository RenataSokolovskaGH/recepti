import jwt, { Algorithm, JwtPayload } from 'jsonwebtoken';
import { loggerHelper } from '.';
import { errorCodes } from '../error-codes';

class JwtHelper {
    async generateToken(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any,
        secret: string

    ) {
        return jwt.sign({ data }, secret, { algorithm: 'HS512' });
    }

    decodeToken(
        token: string,
        secret: string,
        algorithm: Algorithm = 'HS512'

    ) {
        let data: JwtPayload | string = '';

        try {
            data = jwt.verify(
                token,
                secret,
                {
                    algorithms: [algorithm]
                }
            );

        } catch (err) {
            loggerHelper.objectifySystemError(
                {
                    message: err,
                    service: 'jwt-helper',
                }
            )

            throw errorCodes.AccessDenied;
        }
        return data;
    }
}

const instance = new JwtHelper();

export {
    instance,
    JwtHelper
}
