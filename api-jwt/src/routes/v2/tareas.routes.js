import { Router } from "express";
import {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
} from "../../controllers/v2/tareas.controller.js";

const router = Router();

router.get("/", getTareas);
router.post("/", createTarea);
router.put("/:id", updateTarea);
router.delete("/:id", deleteTarea);

export default router;
