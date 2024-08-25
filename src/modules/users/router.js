
import { Router } from "express";
import controller from "./controller.js";
// import { isAuthorized } from '../../middleware/index.js'

const router = Router();

router.post("/login", controller.login);

export default router;


