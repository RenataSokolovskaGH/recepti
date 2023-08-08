import crypto, { BinaryToTextEncoding } from 'crypto';
import { fileConstants } from '../constants';

class ChecksumHelper {
    createChecksum(
        stream: string | Buffer,
        algorithm = 'sha256',
        encoding: BinaryToTextEncoding = 'hex',
        length: number = fileConstants.checksumLength

    ) {
        return crypto
            .createHash(algorithm)
            .update(stream as string, 'utf8')
            .digest(encoding)
            .substring(
                0,
                length
            )
    }
}

const instance = new ChecksumHelper();

export {
    instance,
    ChecksumHelper
} 
