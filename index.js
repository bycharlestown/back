import express, { json } from "express";
import https from "https";
import fs from "fs";
import parserRouter from "./routes/parser.route.js";
import parseData from "./parsercards.js";

// MIDDLEWARE
const app = express();

app.use(express.json());

// EXTRA VARIABLES
const time = 1000 * 60 * 60 * 24 * 7; // EVERY 7 DAYS
const PORT = process.env.PORT || 5000;

// HTTPS SERVER CONFIG
const privateKey = fs.readFileSync("./key.pem");
const certificate = fs.readFileSync("./cert.pem");
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

// PARSING CARDS
parseData();

setInterval(() => {
  parseData();
}, time);

// SERVER SOURCES
app.use("/api", parserRouter);

// START SERVER
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server started on port ${PORT}`);
});
