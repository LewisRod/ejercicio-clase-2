import { prisma } from "../../db.js";

export const getTareas = async (req, res, next) => {
  try {
    const where =
      req.usuario.rol === "admin" ? {} : { usuarioId: req.usuario.id };
    const tareas = await prisma.tarea.findMany({ where });
    res.json(tareas);
  } catch (err) {
    next(err);
  }
};

export const createTarea = async (req, res, next) => {
  try {
    const tarea = await prisma.tarea.create({
      data: { titulo: req.body.titulo, usuarioId: req.usuario.id },
    });
    res.status(201).json(tarea);
  } catch (err) {
    next(err);
  }
};

export const updateTarea = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const tarea = await prisma.tarea.findUnique({ where: { id } });
    if (!tarea) return res.status(404).json({ error: "No encontrada" });

    if (req.usuario.rol !== "admin" && tarea.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const actualizada = await prisma.tarea.update({
      where: { id },
      data: { titulo: req.body.titulo, completada: req.body.completada },
    });
    res.json(actualizada);
  } catch (err) {
    next(err);
  }
};

export const deleteTarea = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const tarea = await prisma.tarea.findUnique({ where: { id } });
    if (!tarea) return res.status(404).json({ error: "No encontrada" });

    if (req.usuario.rol !== "admin" && tarea.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    await prisma.tarea.delete({ where: { id } });
    res.json({ mensaje: "Eliminada" });
  } catch (err) {
    next(err);
  }
};
