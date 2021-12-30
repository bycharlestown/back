import express, { json } from "express";
import https from "https";
import fs from "fs";
import parserRouter from "./routes/parser.route.js";
import ParserCards from "./parserCards.js";
import cors from "cors";

// MIDDLEWARE
const app = express();

app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// EXTRA VARIABLES
const time = 1000 * 60 * 60 * 24 * 7; // EVERY 7 DAYS
const PORT = process.env.PORT || 5000;

// HTTPS SERVER CONFIG
const privateKey = fs.readFileSync("./key.pem");
const certificate = fs.readFileSync("./cert.pem");
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

// PARSING CARDS
// ParserCards.parseData();

// SERVER SOURCES
app.use("/api", parserRouter); // https://localhost:5000/api/parsing_info

// START SERVER
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server started on port ${PORT}`);
});
