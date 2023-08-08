import { Knex } from "knex";
import { commonConstants } from "../../constants";
import { EStatuses } from "../../enums";
import { dbModels } from "../db-models";

exports.up = async (knex: Knex) => {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.accessLog.tableName)) {''
        await knex.schema.createTable(
            dbModels.accessLog.tableName,
            t => {
                t.increments('id').primary();
                t.integer('user_id').unsigned().index();
                t.string('ip').index();
                t.string('user_agent', dbModels.accessLog.length.userAgent);
                t.string('route');
                t.string('status').notNullable().defaultTo(EStatuses.General);

                t.boolean('action_taken').defaultTo(false).index();

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

    await knex.schema.hasTable(dbModels.accessLog.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.accessLog.tableName);
            }
        }
    );
}
