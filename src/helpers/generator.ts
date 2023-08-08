import crypto from 'crypto';

class GeneratorHelper {
    encryptPassword(
        password: string,
        salt = crypto
            .randomBytes(16)
            .toString('hex')

    ) {
        const hash = crypto
            .pbkdf2Sync(
                password,
                salt,
                10000,
                512,
                'sha512'
            )
            .toString('hex');

        return { salt, hash };
    }
}

const instance = new GeneratorHelper();

export {
    instance
}
