import { Router } from "express";
import {
  getTareasPublicas,
  createTareaPublica,
} from "../../controllers/v1/tareas.controller.js";

const router = Router();

router.get("/", getTareasPublicas);
router.post("/", createTareaPublica);

export default router;
