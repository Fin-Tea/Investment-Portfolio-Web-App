
exports.up = function(knex) {
    return knex.schema
    .createTable("improvementAreas", (t) => {
        t.increments("id").unsigned().primary();
        t.integer("journalEntryId")
        .unsigned()
        .index()
        .references("id")
        .inTable("journalEntries");
        t.integer("growthTypeId")
        .unsigned()
        .index()
        .references("id")
        .inTable("growthTypes");
        t.string("action").notNullable();
        t.string("expectedResult").notNullable();
        t.string("actualResult");
        t.dateTime("startDate");
        t.dateTime("endDate");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("improvementAreas");
};
