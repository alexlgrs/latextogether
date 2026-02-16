import { Router } from "express";
import * as ProjectController from "../controllers/ProjectController.js";

const router = Router();

router.get("/", ProjectController.getProjects);
router.get("/projectsfromid", ProjectController.getProjectsFromId);
router.post("/create-project", ProjectController.createProject);
router.get("/:id", ProjectController.getProject);
router.post("/create-document", ProjectController.createDocument);

export default router;
