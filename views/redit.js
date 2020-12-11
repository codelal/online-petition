const { promisify } = require("util");

var redis = require("redis");
var client = redis.createClient({
    host: "localhost",
    port: 6379,
});
//set allows us to export
//this muss richtige Referenz gegeben werden, deshalb bind(client)

module.exports.set = promisify(client.set).bind(client);

module.exports.get = promisify(client.set).bind(client);

module.exports.del = promisify(client.set).bind(client);


module.exports.setex = promisify(client.set).bind(client);



//Mit Callbacks

// client.on("error", function (err) {
//     console.log(err);
// });

// client.set("city", "BElin", (err, data) => {
//     console.log("set done", data);
// });

// client.get("city", (err, data) => {
//     console.log("data in city", data);
// });
