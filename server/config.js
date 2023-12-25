module.exports = {
  clientBaseUrl: "http://localhost:3000",
  tda: {
    consumerKey: "HPHK14AGV5MPRVS1W2CWGFEGNDIXLDRB@AMER.OAUTHAP",
    baseUrl: "https://api.tdameritrade.com/v1/",
    redirectUri: "https://127.0.0.1:8080",
    daysUntilRefresh: 10,
    daysUntilNextSync: 6,
  },
  db: {
    database: "growthtrack",
    user: "svc-growthtrack",
    password: "TB[t%Aq4(B@k]K8Q", // FIX: Security risk - make secret
    timezone: "UTC",
    typeCast: function (field, next) {
      // console.log(`field type: ${field.type}`);
      if (field.type == "NEWDECIMAL") {
        const value = field.string();
        // console.log(`field value: ${value}`);
        return value === null ? null : Number(value);
      }
      return next();
    },
  },
  auth: {
    jwtTokenSecret:
      "2KxACriKy1me852ykXmXu6r8SfLHftt3xwmCiuclac1WgX3a6oRIM14CcqY/OKb9jccXq1btsJgf2xnZAhal16FCM4aPOGJ+HFnbCk1ALXEsAys6x9yx186v8FuCvcPnqXNG08DAz5cFcJ+ldXsCKXVqVWc6A1NNKbPMKFyNXqKpz9whTTePgEovai5Os9TUAofr7wVN4jGLTODpSS7nDgwWibaHxghX+jLfI4M4tDtOvNbnaawo4xG3XGJpjFNYvzY1CDSjrO5gORAwIU5mknCW2Hg2bXzAaVYeqlcggBK3IFQTA/lQ8YRBhOEEPP7WKjplIPD2LUkMbWkdbrXvTg==",
  },
};
