import { Router } from "express";
import * as ProjectController from "../controllers/ProjectController.js";

const router = Router();

router.get("/", ProjectController.getProjects);
router.get("/projectsfromid", ProjectController.getProjectsFromId);
router.post("/create-project", ProjectController.createProject);
router.get("/:id", ProjectController.getProject);
router.post("/create-document", ProjectController.createDocument);
router.get("/get-document/:documentId", ProjectController.getDocument);
// router.post("/upload-image", ProjectController.upload.single('image'), ProjectController.uploadImage);
router.post('/uploadFile', ProjectController.upload.single('image'), ProjectController.uploadFile);



// Source - https://stackoverflow.com/a/61155160
// Posted by Sayooj V R, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-04, License - CC BY-SA 4.0

export default router;
