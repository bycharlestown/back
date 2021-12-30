import client from "../db.js";

client.connect();

class ParserController {
  // Get all CARDS
  getCards(req, res) {
    client.query("SELECT * FROM cards_info;", (err, resp) => {
      if (err) throw err;

      const result = resp.rows;

      res.send(result);
    });
  }

  // Get description of the CARD ID
  getFullDescriptions(req, res) {
    const { id } = req.params;

    client.query(
      "SELECT * FROM full_descriptions WHERE card_id = $1;",
      [id],
      (err, resp) => {
        if (err) throw err;

        const result = resp.rows[0];

        res.send(result);
      }
    );
  }
}

export default new ParserController();
