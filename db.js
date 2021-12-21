import pg from "pg";

const conString =
  "postgres://molwvggo:WGmorLxYyBWhBRvHQ0JQcYiXubolMKUu@abul.db.elephantsql.com/molwvggo";

const client = new pg.Client(conString);

// client.connect(async function (err) {
//   try {
//     if (err) {
//       return console.error("could not connect to postgres", err);
//     }

//     client.query('SELECT NOW() AS "theTime"', function (err, result) {
//       if (err) {
//         return console.error("error running query", err);
//       }
//       console.log(result.rows[0].theTime);

//       client.end();
//     });
//   } catch (error) {
//     console.error(error);
//   }
// });

export default client;
