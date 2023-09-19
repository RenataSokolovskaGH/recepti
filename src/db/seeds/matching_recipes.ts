import { Knex } from "knex";
import { dbModels } from '../db-models';
import matchingSeed from '../../matching_recipes.json';

exports.seed = async (knex: Knex): Promise<void> => {
    const matchingRecipesTable = dbModels.matchingRecipes.tableName

    if (await knex.schema.hasTable(matchingRecipesTable)) {
        await knex(matchingRecipesTable).truncate();
    }

    await knex(matchingRecipesTable).insert(matchingSeed);
};
