import { Knex } from "knex";
import { commonConstants } from "../../constants";
import { EStatuses } from "../../enums";
import { dbModels } from "../db-models";

export async function up(knex: Knex): Promise<void> {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.usersSessions.tableName)) {
        await knex.schema.createTable(
            dbModels.usersSessions.tableName,
            t => {
                t.increments('id').primary();
                t.integer('user_id').unsigned().notNullable().index();
                t.string('access_token').notNullable().index();
                t.string('status').notNullable().defaultTo(EStatuses.Active).index();

                t.integer('known_session_id').unsigned().index();

                t.timestamp('expired_at').notNullable().defaultTo(knex.fn.now());
                t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
            }
        )
    }
}

export async function down(knex: Knex): Promise<void> {
    if (!commonConstants.db.grantUnsafeMigration) {
        return;
    }

    await knex.schema.hasTable(dbModels.usersSessions.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.usersSessions.tableName);
            }
        }
    );
}
