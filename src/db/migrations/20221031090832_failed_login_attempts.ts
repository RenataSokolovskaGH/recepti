import { Knex } from "knex";
import { commonConstants } from "../../constants";
import { dbModels } from "../db-models";

export async function up(knex: Knex): Promise<void> {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.failedLoginAttempts.tableName)) {
        await knex.schema.createTable(
            dbModels.failedLoginAttempts.tableName,
            t => {
                t.increments('id').primary();
                t.string('client_ip').notNullable().index();
                t.string('user_name').notNullable().index();
                t.string('status').notNullable().index();
                t.boolean('resolved').notNullable().index().defaultTo(false);
                t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
            }
        );
    }
}

export async function down(knex: Knex): Promise<void> {
    if (!commonConstants.db.grantUnsafeMigration) {
        return;
    }

    await knex.schema.hasTable(dbModels.failedLoginAttempts.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.failedLoginAttempts.tableName);
            }
        }
    );
}
