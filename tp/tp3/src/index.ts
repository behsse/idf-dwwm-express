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
];

app.get("/api/games", (req : Request, res : Response) => {
    res.json(games);
});

app.post("/api/games", (req: Request, res : Response) => {
    const {title, platform, year, isFavorite} = req.body;
    const newGame : Game = {
        id : games.length + 1,
        title,
        platform,
        year,
        isFavorite : isFavorite || false
    };

    if(!title || !platform) {
        return res.status(404).json({
            message : "Les champs title et platform sont obligatoires"
        })
    }

    games.push(newGame);
    res.status(201).json(newGame);
});

app.post("/api/games/batch", (req : Request, res : Response) => {
    const newGames : Game[] = req.body;

    const gameWithID = newGames.map((game) => ({
        ...game,
        id : games.length + 1,
    }));

    games.push(...gameWithID);

    res.status(201).json(gameWithID.length);
});

app.put("/api/games/:id", (req : Request, res : Response) => {
    const {id} = req.params;
    const {title, platform, year, isFavorite} = req.body;
    
    const gameIndex = games.findIndex((g) => g.id === Number(id));

    if(gameIndex === -1){
        return res.status(404).json({
            message : "Game not found"
        });
    };

    if(!title || !platform || !year){
        return res.status(400).json({
            message : "Tous les champs sont obligatoires"
        })
    }
    const updateGame : Game = {
        id : games[gameIndex].id,
        title,
        year,
        platform,
        isFavorite : isFavorite || false
    };

    games[gameIndex] = updateGame;
    res.status(200).json(updateGame)
});

app.patch("/api/games/:id", (req : Request, res : Response) => {
    const id = Number(req.params.id);
    const { title, platform, year, isFavorite} = req.body
    
    const gameIndex = games.findIndex((g) => g.id === id);

    if(gameIndex === -1){
        return res.status(404).json({
            message : "Game not found"
        });
    };

    const updateGame : Game = {
        ...games[gameIndex],
        ...(title && {title}),
        ...(platform && {platform}),
        ...(year && {year}),
        ...(isFavorite !== undefined && {isFavorite})
    };

    games[gameIndex] = updateGame;
    res.status(200).json(updateGame);
});

app.patch("/api/games/:id/favorite", (req : Request, res : Response) => {
    const {id} = req.params
    const gameIndex = games.findIndex((g) => g.id === Number(id));

    if(gameIndex === -1){
        return res.status(404).json({
            message : "Game not found"
        });
    };

    games[gameIndex].isFavorite = !games[gameIndex].isFavorite;
    res.status(200).json(games[gameIndex]);
});

app.delete("/api/games/:id", (req : Request, res : Response) => {
    const {id} = req.params;
    const gameIndex = games.findIndex((g) => g.id === Number(id));

    if(gameIndex === -1){
        return res.status(404).json({
            message : "Game not found"
        });
    };

    games.splice(gameIndex, 1);

    res.status(200).json({
        message : "Delete game succed"
    })

});

app.post("/api/games/:id/duplicate", (req : Request, res : Response) => {
    const {id} = req.params;
    const gameIndex = games.findIndex((g) => g.id === Number(id));

    if(gameIndex === -1){
        return res.status(404).json({
            message : "Game not found"
        });
    };

    const duplicateGame : Game = {
        ...games[gameIndex],
        id : games.length + 1,
        title : `Copie de ${games[gameIndex].title}`
    }
    
    games.push(duplicateGame);
    res.status(201).json(duplicateGame);
});

app.patch("/api/games/favorite/clear", (req : Request, res : Response) => {
    games.map(game => (
        game.isFavorite = false
    ));

    res.status(200).json({
        message : "Tous les jeux sont retirés des favoris"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
});