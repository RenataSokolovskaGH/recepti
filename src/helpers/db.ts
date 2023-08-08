import { IAlterDBColumnParams } from "../interfaces";

class DBHelper {
    async alterDBColumns(
        {
            alterCandidates,
            knex,
            tableName
        }: IAlterDBColumnParams

    ): Promise<string[]> {
        const alteredResult: string[] = [];

        for (const [colName, columnUpdateParams] of alterCandidates) {
            if (
                !await knex.schema.hasColumn(
                    tableName,
                    colName
                ) ||
                columnUpdateParams.updateAlways
            ) {
                await knex.schema.alterTable(
                    tableName,
                    columnUpdateParams.callback
                )

                alteredResult.push(
                    colName
                )
            }
        }

        return alteredResult;
    }
}

const instance = new DBHelper();

// not exporting through default due to migration interconnection

export {
    instance,
    DBHelper
}

