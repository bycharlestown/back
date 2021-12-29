import client from "../db.js";

class ParserController {
  // CHECKING DATA BASE INFO
  async getAllParsingInfo(req, res) {
    client.connect();

    client.query(
      "SELECT * FROM cards_info LEFT JOIN full_descriptions ON cards_info.id = full_descriptions.card_id ",
      async (err, resp) => {
        if (err) throw err;

        const result = resp.rows;

        res.send(result);
      }
    );

    // client.end();
  }
}

export default new ParserController();
