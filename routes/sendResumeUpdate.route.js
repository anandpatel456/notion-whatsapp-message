import { Router } from "express";
import { getToken } from "../methods/notionWebhook.js";
// import { fetchNumber } from "../Api/getNameNumber.js";

const router = Router();

router.route("/notionwebhook").post(getToken)
// router.route("/getnum").post(fetchNumber)

export default router