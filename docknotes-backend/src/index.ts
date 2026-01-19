import express, {Request, Response} from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req : Request, res : Response) => {
    res.json({
        message : "Bienvenue sur l'API de Docknotes"
    });
});

interface Note {
    id : string,
    color : string,
    content : string,
    date : Date,
    isFavorite : boolean
};

const notes : Note[] = [
    {
        id : "1",
        color : "red",
        content : "Apprendre JAVASCRIPT",
        date : new Date("2026-01-19"),
        isFavorite : true
    },
    {
        id : "2",
        color : "blue",
        content : "Créer un serveur backend",
        date : new Date("2026-01-14"),
        isFavorite : false
    }
];

app.get("/notes", (req : Request, res : Response) => {
    res.json(notes);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});