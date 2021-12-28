import Router from "express";
import ParserController from "../controller/parser.controller.js";

const router = new Router();

router.get("/parsing_info", ParserController.getAllParsingInfo);

export default router;
