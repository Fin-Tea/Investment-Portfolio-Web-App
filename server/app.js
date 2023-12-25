import server, { PORT } from "./server";

// add error-handling: app crashes on api error whereas it should log error and stay running
(function() {
    try {
        server.listen(PORT, () => { console.log(`listening on ${PORT}`) });
    } catch(e) {
        console.log(JSON.stringify(e));
    }
})();