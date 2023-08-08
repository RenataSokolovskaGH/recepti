import { dbModels } from '../db-models'
import { Knex } from 'knex';
import { commonConstants } from '../../constants';

exports.up = async (knex: Knex) => {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.userActivityLog.tableName)) {
        await knex.schema.createTable(
            dbModels.userActivityLog.tableName,
            t => {
                t.increments('id').primary();
                t.integer('user_id').unsigned().notNullable().index();

                t.string('activity_type').notNullable().index();
                t.jsonb('metadata');

                t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
            }
        )
    }
}

exports.down = async (knex: Knex) => {
    if (!commonConstants.db.grantUnsafeMigration) {
        return;
    }

    await knex.schema.hasTable(dbModels.userActivityLog.tableName).then((exists: boolean) => {
        if (exists) {
            return knex.schema.dropTable(dbModels.userActivityLog.tableName);
        }
    });
}
