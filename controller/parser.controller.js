import client from "../db.js";

client.connect();
// client.end();

class ParserController {
  // CHECKING DATA BASE INFO
  async getAllParsingInfo(req, res) {
    client.query("SELECT * from parse_info;", async (err, resp) => {
      if (err) throw err;

      const result = resp.rows;

      res.send(result);
    });
  }

  // FILLING DATA BASE from PARSER DATA
  async createParsingInfo(req, res) {
    const { title, price, category } = parser;

    client.query(
      "INSERT INTO parse_info(title, price, category) VALUES($1, $2, $3) RETURNING *;",
      [title, price, category]
    );

    console.log(title, price, category);

    // res.json("ok");
  }
}

export default new ParserController();
