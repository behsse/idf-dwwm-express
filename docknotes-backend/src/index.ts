// On importe Express - c'est comme une boîte à outils pour créer un site web
// Express est un framework Node.js qui simplifie la création de serveurs HTTP
// Request = les infos de la demande du client, Response = ce qu'on lui renvoie
import express, {Request, Response} from 'express';

// On crée notre application (notre petit serveur web)
// express() retourne une instance d'application Express qu'on stocke dans "app"
const app = express();

// Le numéro de la porte par laquelle on entre (le port 3000)
// Le port est un numéro qui identifie notre serveur sur la machine (0-65535)
// On utilise 3000 par convention pour le développement (80 = HTTP, 443 = HTTPS en production)
const port = 3000;

// Ceci permet à notre serveur de comprendre les messages en format JSON
// C'est un middleware qui parse le body des requêtes en JSON
// Sans ça, req.body serait undefined quand on reçoit des données POST/PUT
app.use(express.json());

// ========== LES ROUTES (les chemins pour accéder aux différentes pages) ==========
// Une route = une URL + une méthode HTTP (GET, POST, PUT, DELETE)
// app.get() crée une route qui répond aux requêtes HTTP GET

// Route d'accueil : quand on va sur la racine du site "/"
// C'est la page principale, comme la porte d'entrée d'une maison
app.get("/", (req : Request, res : Response) => {
    // res.json() envoie une réponse avec Content-Type: application/json
    // et convertit automatiquement l'objet JavaScript en chaîne JSON
    res.json({
        message : "Bienvenue sur l'API de Docknotes"
    });
});

// Ceci est une "interface" - c'est comme une fiche d'identité pour une note
// Elle dit quelles informations chaque note doit avoir obligatoirement
// Ici l'interface est définie dans le même fichier (on pourrait la mettre dans un fichier séparé)
interface Note {
    id : string,          // Un identifiant unique pour reconnaître chaque note (ici c'est une string, pas un number)
    title : string,       // Le titre de la note (par exemple "Javascript")
    color : string,       // La couleur de la note pour l'affichage (ex: "red", "blue")
    content : string,     // Le contenu de la note (ce qu'on a écrit dedans)
    date : Date,          // La date de création (objet Date JavaScript)
    isFavorite : boolean  // Est-ce qu'on aime cette note ? true = oui, false = non
};

// Ici on crée une liste de notes - c'est comme un carnet de notes
// On déclare un tableau typé Note[] - TypeScript vérifie que chaque objet respecte l'interface
// En vrai projet, ces données viendraient d'une base de données (MySQL, MongoDB, etc.)
const notes : Note[] = [
    {
        id : "1",
        title : "Javascript",
        color : "red",
        content : "Apprendre JAVASCRIPT",
        date : new Date("2026-01-19"),  // new Date() crée un objet Date à partir d'une string
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

// Route pour récupérer toutes les notes, avec possibilité de filtrer par contenu
// Exemple : /notes renvoie toutes les notes
// Exemple : /notes?title=javascript renvoie les notes contenant "javascript" dans leur contenu
// Cette route utilise des query parameters (?clé=valeur) pour le filtrage optionnel
app.get("/notes", (req : Request, res : Response) => {
    // On récupère ce qu'on cherche (le titre/contenu)
    // req.query contient les paramètres après le ? dans l'URL
    // Ex: /notes?title=backend → req.query = { title: "backend" }
    const {title} = req.query;

    // Si on a donné un titre à chercher...
    // On vérifie que title existe ET que c'est une string (TypeScript safety)
    // car req.query peut contenir des types variés (string, string[], undefined)
    if(title && typeof title === "string"){
        // On filtre les notes pour garder seulement celles qui contiennent le mot cherché
        // filter() crée un nouveau tableau avec les éléments qui passent le test
        // includes() vérifie si une string contient une sous-chaîne
        // toLowerCase() met tout en minuscules pour une recherche case-insensitive
        // Note : on cherche dans "content" et non dans "title" malgré le nom du paramètre
        const filterNotes = notes.filter((n) => n.content.toLowerCase().includes(title.toLowerCase()));
        res.json(filterNotes);
        return; // return arrête l'exécution pour ne pas continuer après
    }
    // Si on n'a rien cherché, on renvoie toutes les notes
    res.json(notes);
});

// Route pour récupérer UNE note par son identifiant
// Exemple : /notes/1 nous donnera la note avec l'id "1"
// :id est un paramètre d'URL dynamique (route parameter)
app.get("/notes/:id", (req : Request, res : Response) => {
    // On récupère l'id depuis l'adresse
    // req.params contient tous les paramètres d'URL (ici { id: "valeur" })
    // La déstructuration { id } extrait directement la propriété id
    const { id } = req.params;

    // On cherche la note qui a cet id dans notre liste
    // find() retourne le PREMIER élément qui satisfait la condition, ou undefined
    // Différent de filter() qui retourne un tableau de TOUS les éléments correspondants
    // Ici on compare directement les strings (pas besoin de Number() car id est une string)
    const note = notes.find((n) => n.id === id);

    // Si on ne trouve pas la note, on dit qu'elle n'existe pas (erreur 404)
    // 404 Not Found = la ressource demandée n'existe pas
    // C'est le code HTTP standard pour "pas trouvé"
    if(!note){
        res.status(404).json(
            {
                message : "Note not found"
            }
        )
    }
    // Si on l'a trouvée, on l'envoie !
    res.json(note);
})

// On démarre le serveur ! C'est comme allumer la lumière de notre boutique
// À partir de maintenant, les gens peuvent visiter notre site
// app.listen() démarre le serveur HTTP et écoute sur le port spécifié
// Le callback est exécuté une fois que le serveur est prêt à recevoir des requêtes
// Template literal `${}` permet d'insérer des variables dans une string
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
