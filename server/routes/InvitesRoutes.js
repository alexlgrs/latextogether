import { Router } from "express";


import handleInvite from "../controllers/InviteController.js";

const router = Router();

router.post("/:projectId", handleInvite);

export default router;
