import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { env } from "node:process";

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

import {login, register} from "../controllers/AuthController"

const router = Router();

router.post("/login", login)
router.post("/register", register)

export default router;
