import express, { Request, Response } from "express";
import db from "@/config/database";
import { ResultSetHeader } from "mysql2";
import { Category } from "@/interfaces/categories.interface";

const router: express.Router = express.Router();

// ============================================
// GET - Récupérer toutes les catégories
// ============================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const [data] = await db.query("SELECT * FROM categories");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ============================================
// GET - Récupérer une catégorie par ID
// ============================================
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [data] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
    const categories = data as Category[];

    if (categories.length === 0) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(categories[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ============================================
// POST - Créer une nouvelle catégorie
// ============================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Le champ 'name' est obligatoire" });
      return;
    }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    const newCategory = {
      id: result.insertId,
      name,
      description: description || null,
    };

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ============================================
// PUT - Remplacer une catégorie entièrement
// ============================================
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Le champ 'name' est obligatoire" });
      return;
    }

    const [result] = await db.query<ResultSetHeader>(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const [data] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
    res.json((data as Category[])[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ============================================
// PATCH - Modifier partiellement une catégorie
// ============================================
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (updates.length === 0) {
      res.status(400).json({ message: "Aucun champ à modifier" });
      return;
    }

    values.push(Number(id));

    const [result] = await db.query<ResultSetHeader>(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const [data] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
    res.json((data as Category[])[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ============================================
// DELETE - Supprimer une catégorie
// ============================================
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

export default router;
