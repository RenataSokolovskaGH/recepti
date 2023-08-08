import basicAuth from 'express-basic-auth';
import { config } from "dotenv";

config();
export default basicAuth({
    users: {
        [process.env.BASIC_AUTH_USER_NAME || 'admin']: process.env.BASIC_AUTH_PASSWORD || 'password',
    },
    challenge: true,
});
