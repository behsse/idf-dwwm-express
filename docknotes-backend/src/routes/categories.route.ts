import express, {Request, Response} from "express";
import db from "@/config/database";
import { ResultSetHeader } from "mysql2";
import { Category } from "@/interfaces/categories.interface";

const router : express.Router = express.Router();

router.get("/", async (req : Request, res : Response) => {
    try {
        const [data] = await db.query("SELECT * FROM categories");
        res.json(data)
    } catch (error) {
        res.status(500).json({message : "Server error", error})
    }
});

export default router