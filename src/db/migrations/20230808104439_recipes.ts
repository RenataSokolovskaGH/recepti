import { dbModels } from '../db-models'
import { Knex } from 'knex';

const tableName = dbModels.recipes.tableName;

exports.up = async (knex: Knex) => {
    const updateStamp = knex.raw(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    );

    if (!await knex.schema.hasTable(tableName)) {
        await knex.schema.createTable(
            tableName,
            t => {
                t.increments('id').primary();
                t.string('name').notNullable().index();
                t.string('ingredients', dbModels.recipes.length.ingredients).notNullable().index();
                t.specificType('avatar', 'mediumtext');
                t.integer('calories').unsigned().notNullable().index();
                t.string('making_procedure', dbModels.recipes.length.makingProcedure).notNullable();
                t.string('diet_flag').index();
                t.string('description').notNullable();
                t.boolean('is_sweet').notNullable().index();

                t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at').notNullable().defaultTo(updateStamp);
            }
        )
    }
}

exports.down = async (knex: Knex) => {
    await knex.schema.hasTable(tableName).then((exists: boolean) => {
        if (exists) {
            return knex.schema.dropTable(tableName);
        }
    });
}
