import { Knex } from "knex";
import { dbModels } from '../db-models';
import recipeSeed from '../../recipes_seed.json';

exports.seed = async (knex: Knex): Promise<void> => {
    const recipesTable = dbModels.recipes.tableName

    if (await knex.schema.hasTable(recipesTable)) {
        await knex(recipesTable).truncate();
    }

    await knex(recipesTable).insert(recipeSeed);
};
