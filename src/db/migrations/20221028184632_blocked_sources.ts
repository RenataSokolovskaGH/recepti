import { Knex } from 'knex';
import { commonConstants } from '../../constants';
import { dbModels } from '../db-models'

exports.up = async (knex: Knex) => {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.blockedSources.tableName)) {
        await knex.schema.createTable(
            dbModels.blockedSources.tableName,
            t => {
                t.increments('id').primary();
                t.string('ip').notNullable().index();
                t.string('user_agent', dbModels.blockedSources.length.userAgent).index();
                t.integer('user_id').unsigned().index();
                t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
            }
        );
    }
}

exports.down = async (knex: Knex) => {
    if (!commonConstants.db.grantUnsafeMigration) {
        return;
    }

    await knex.schema.hasTable(dbModels.blockedSources.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.blockedSources.tableName);
            }
        }
    );
}
