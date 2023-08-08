import { Knex } from "knex";
import { commonConstants } from "../../constants";
import { dbModels } from "../db-models";


export async function up(knex: Knex): Promise<void> {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.credentials.tableName)) {
        await knex.schema.createTable(
            dbModels.credentials.tableName,
            t => {
                t.increments('user_id').primary()
                t.string('hash', dbModels.credentials.length.hash).notNullable();
                t.string('salt', dbModels.credentials.length.salt).notNullable();
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

    await knex.schema.hasTable(dbModels.credentials.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.credentials.tableName);
            }
        }
    );
}
