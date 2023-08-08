import { Knex } from "knex";
import { ESystemEnv } from "./src/enums";
import { config as configDotenv } from "dotenv";
import { sysEnvironment } from "./src/constants";

configDotenv();
const env = sysEnvironment || ESystemEnv.Development;

const config: Record<string, Knex.Config> = {
  dev: {
    client: 'mysql2',

    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEMA
    },

    pool: {
      min: 2,
      max: 10
    },

    migrations: {
      tableName: 'law_db_migrations',
      directory: __dirname + '/dist/src/db/migrations'
    },

    seeds: {
      directory: __dirname + '/dist/src/db/seeds'
    }

  },
  make: {
    client: 'mysql2',

    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEMA
    },

    pool: {
      min: 2,
      max: 10
    },

    migrations: {
      tableName: 'law_db_migrations',
      directory: __dirname + '/src/db/migrations'
    },

    seeds: {
      directory: __dirname + '/src/db/seeds'
    }

  },
  production: {
    client: 'mysql2',

    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEMA
    },

    pool: {
      min: 2,
      max: 10
    },

    migrations: {
      tableName: 'law_db_migrations',
      directory: __dirname + '/dist/src/db/migrations'
    },

    seeds: {
      directory: __dirname + '/dist/src/db/seeds'
    }

  },
  prem: {
    client: 'mysql2',

    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEMA
    },

    pool: {
      min: 2,
      max: 10
    },

    migrations: {
      tableName: 'law_db_migrations',
      directory: __dirname + '/src/db/migrations'
    },

    seeds: {
      directory: __dirname + '/src/db/seeds'
    }

  }
};

export default config[env];
