
exports.up = function(knex) {
    return knex.schema
    .createTable("reflections", (t) => {
        t.increments("id").unsigned().primary();
        t.integer("journalEntryId")
        .unsigned()
        .index()
        .references("id")
        .inTable("journalEntries");
        t.enum("timeframeType", ["Daily", "Weekly", "Monthly", "Yearly"]).notNullable();
        t.enum("moodType", ["Okay", "Good", "Bad"]).notNullable();
        t.enum("energyType", ["Neutral", "High", "Low"]).notNullable();
        t.string("thoughts", 1000).notNullable(); 
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("reflections");
};
