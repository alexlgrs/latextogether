import { Router } from "express";


import compileToPdf from "../controllers/EditorController.js";

const router = Router();

router.post("/compile", compileToPdf)

export default router;
