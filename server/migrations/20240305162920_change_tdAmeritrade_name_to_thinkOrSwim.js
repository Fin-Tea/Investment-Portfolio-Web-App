
exports.up = function(knex) {
    const now = new Date();
    return knex('platforms')
    .update({ name: "thinkorswim", description: "Your one-stop trading app that packs the features and power of thinkorswim desktop into the palm of your hand. Analyze market movements and trade products ...", url: "https://www.tdameritrade.com/tools-and-platforms/thinkorswim.html", updatedAt: now })
    .where({id: 1});
};

exports.down = function(knex) {
    const now = new Date();
    return knex('platforms')
    .update({ name: "TD Ameritrade", description: "The best online broker for online stock trading, long-term investing, and retirement planning", url: "https://www.tdameritrade.com/", updatedAt: now })
    .where({id: 1});
};
