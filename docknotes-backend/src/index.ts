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
    title : string,
    color : string,
    content : string,
    date : Date,
    isFavorite : boolean
};

const notes : Note[] = [
    {
        id : "1",
        title : "Javascript",
        color : "red",
        content : "Apprendre JAVASCRIPT",
        date : new Date("2026-01-19"),
        isFavorite : true
    },
    {
        id : "2",
        title : "Backend",
        color : "blue",
        content : "Créer un serveur backend",
        date : new Date("2026-01-14"),
        isFavorite : false
    }
];

app.get("/notes", (req : Request, res : Response) => {
    const {title} = req.query;

    if(title && typeof title === "string"){
        const filterNotes = notes.filter((n) => n.content.toLowerCase().includes(title.toLowerCase()));
        res.json(filterNotes);
        return;
    }
    res.json(notes);
});

app.get("/notes/:id", (req : Request, res : Response) => {
    const { id } = req.params;
    const note = notes.find((n) => n.id === id);

    if(!note){
        res.status(404).json(
            {
                message : "Note not found"
            }
        )
    }
    res.json(note);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});