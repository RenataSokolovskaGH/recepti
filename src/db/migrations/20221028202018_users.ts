import { Knex } from "knex";
import { commonConstants } from "../../constants";
import { dbModels } from "../db-models";

export async function up(knex: Knex): Promise<void> {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.users.tableName)) {
        await knex.schema.createTable(
            dbModels.users.tableName,
            t => {
                t.increments('id').primary();
                t.string('user_name', dbModels.users.length.userName).unique().notNullable();
                t.string('account_type', dbModels.users.length.account_type).notNullable().index();

                t.string('first_name', dbModels.users.length.firstName).notNullable().index();
                t.string('last_name', dbModels.users.length.firstName).notNullable().index();
                t.string('job_title', dbModels.users.length.jobTitle).index();

                t.string('status', dbModels.users.length.status).notNullable().index();

                t.jsonb('avatar');
                t.string('email').index();

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

    await knex.schema.hasTable(dbModels.users.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.users.tableName);
            }
        }
    );
}
