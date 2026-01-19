import express, {Request, Response} from "express";
import { Game } from "./interfaces/game.interface";

const app = express();
const PORT = 3000;

app.use(express.json());

const games : Game[] = [
{
        id : 1,
        title : "valorant",
        platform : "PC",
        year : 2020,
        isFavorite : true
    },
    {
        id : 2,
        title : "Genshin Impact",
        platform : "PC",
        year : 2020,
        isFavorite : false
    },
    {
        id : 3,
        title : "minecraft",
        platform : "Multi-platform",
        year : 2011,
        isFavorite : true
    },
    {
        id : 4,
        title : "pacman",
        platform : "Arcade",
        year : 1980,
        isFavorite : true
    },
    {
        id : 5,
        title: "The Legend of Zelda: Ocarina of Time",
        platform : "Nintendo 64",
        year : 1998,
        isFavorite : true
    }
]

app.get("/", (req : Request, res : Response) => {
    res.json(
        {
            message : "Bienvenue dans ma bibliothèque de jeux vidéos"
        }
    );
});

app.get("/api/status", (req : Request, res : Response) => {
    res.json(
        {
            date : new Date().toLocaleTimeString('fr-FR'),
            name : "TP1 API"
        }
    )
});

app.get("/api/games", (req : Request, res : Response) => {
    res.json(games);
});

app.get("/api/games/first", (req : Request, res : Response) => {
    res.json(games[0]);
});

app.get("/api/games/count", (req : Request, res : Response) => {
    res.json(
        {
            total : games.length
        }
    );
});

app.get("/api/games/retro", (req : Request, res : Response) => {
    const retro = games.filter(game => game.year <= 2000);
    res.json(retro);
});

app.get("/api/games/platforms", (req : Request, res : Response) => {
    const plaforms = [...new Set(games.map(game => game.platform))];
    res.json(plaforms);
});

app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
});