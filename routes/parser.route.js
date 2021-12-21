import Router from "express";
import ParserController from "../controller/parser.controller.js";

const router = new Router();

router.get("/parsing_info", ParserController.getAllParsingInfo);
router.get("/get_cards_info", ParserController.createParsingInfo);

export default router;
