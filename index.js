import express, { json } from "express";
import https from "https";
import fs from "fs";
import parserRouter from "./routes/parser.route.js";

const app = express();

const PORT = process.env.PORT || 5000;

const privateKey = fs.readFileSync("./key.pem");
const certificate = fs.readFileSync("./cert.pem");
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

app.use(express.json());

app.use("/api", parserRouter);

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server started on port ${PORT}`);
});
