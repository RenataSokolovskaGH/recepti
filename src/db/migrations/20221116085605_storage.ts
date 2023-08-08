import { Knex } from "knex";
import { commonConstants, fileConstants } from "../../constants";
import { dbModels } from "../db-models";

export async function up(knex: Knex): Promise<void> {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(dbModels.storage.tableName)) {
        await knex.schema.createTable(
            dbModels.storage.tableName,
            t => {
                t.increments('id').primary();
                t.integer('owner_user_id').unsigned().index();
                t.string('file_hash').notNullable().index();
                t.string('relative_file_path').notNullable().index();
                t.string('file_type').notNullable().index();
                t.string('checksum', dbModels.storage.length.checksum).index();
                t.string('file_name', fileConstants.maxFileNameLength).index();
                t.integer('file_size').unsigned().index();
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

    await knex.schema.hasTable(dbModels.storage.tableName).then(
        (exists: boolean) => {
            if (exists) {
                return knex.schema.dropTable(dbModels.storage.tableName);
            }
        }
    );
}
