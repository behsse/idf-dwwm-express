import express, { Request, Response } from "express";
import db from "@/lib/db";
import { Category } from "@/interfaces/categories.interface";

const router: express.Router = express.Router();

// ============================================
// GET - Récupérer toutes les catégories
// ============================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const data = await db.category.findMany();
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
    const data = await db.category.findUnique({where : {id: Number(id)}})

    if (!data) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(data);
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

    const newCategory = await db.category.create({
      data :  {
        name,
        description : description || null
      }
    });

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

    const category = await db.category.update({
      where: {id : Number(id)},
      data : {
        name,
        description : description || null
      }
    });
    res.json(category);
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
    
    const data : {name? : string; description? : string} = {}

    if (name !== undefined) {
      data.name = name
    }
    if (description !== undefined) {
      data.description = description
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: "Aucun champ à modifier" });
      return;
    }

    const category = await db.category.update({
      where: {id : Number(id)},
      data
    })

    res.json(category);
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

    const data = await db.category.delete({
      where: {id : Number(id)}
    })

    res.status(204).json(data);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

export default router;
