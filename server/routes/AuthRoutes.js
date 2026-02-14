import { Router } from "express";
import { User } from "../models/User.js";
import { env } from "node:process";

import {login, register} from "../controllers/AuthController.js"

const router = Router();

router.post("/login", login)
router.post("/register", register)

export default router;
