import { logger } from "./helpers/logger";
import { bootstrap } from "./server";
import { config } from "dotenv";

config();
bootstrap()
    .catch(err => logger(err));
