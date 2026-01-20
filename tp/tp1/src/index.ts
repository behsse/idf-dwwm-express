// On importe Express - c'est comme une boîte à outils pour créer un site web
// Express est un framework Node.js qui simplifie la création de serveurs HTTP
// Request = les infos de la demande du client, Response = ce qu'on lui renvoie
import express, {Request, Response} from "express";

// On importe notre fiche d'identité "Game" qu'on a créée dans un autre fichier
// On importe l'interface TypeScript pour typer nos données et avoir l'autocomplétion
import { Game } from "./interfaces/game.interface";

// On crée notre application (notre petit serveur web)
// express() retourne une instance d'application Express qu'on stocke dans "app"
const app = express();

// Le numéro de la porte par laquelle on entre (le port 3000)
// Le port est un numéro qui identifie notre serveur sur la machine (0-65535)
// On utilise 3000 par convention pour le développement (80 = HTTP, 443 = HTTPS en production)
const PORT = 3000;

// Ceci permet à notre serveur de comprendre les messages en format JSON
// C'est un middleware qui parse le body des requêtes en JSON
// Sans ça, req.body serait undefined quand on reçoit des données POST/PUT
app.use(express.json());

// Ici on crée une liste de jeux vidéo - c'est comme un catalogue de jeux
// On déclare un tableau typé Game[] - TypeScript vérifie que chaque objet respecte l'interface
// En vrai projet, ces données viendraient d'une base de données (MySQL, MongoDB, etc.)
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

// ========== LES ROUTES (les chemins pour accéder aux différentes pages) ==========
// Une route = une URL + une méthode HTTP (GET, POST, PUT, DELETE)
// app.get() crée une route qui répond aux requêtes HTTP GET

// Route d'accueil : quand on va sur la racine du site "/"
// C'est la page principale, comme la porte d'entrée d'une maison
app.get("/", (req : Request, res : Response) => {
    // res.json() envoie une réponse avec Content-Type: application/json
    // et convertit automatiquement l'objet JavaScript en chaîne JSON
    res.json(
        {
            message : "Bienvenue dans ma bibliothèque de jeux vidéos"
        }
    );
});

// Route pour connaître le statut de l'API (est-ce qu'elle fonctionne ?)
// Utile pour vérifier que le serveur est bien en ligne (health check)
app.get("/api/status", (req : Request, res : Response) => {
    // new Date() crée un objet avec la date et l'heure actuelle
    // toLocaleTimeString('fr-FR') formate l'heure en français (ex: "14:30:25")
    res.json(
        {
            date : new Date().toLocaleTimeString('fr-FR'),
            name : "TP1 API"
        }
    )
});

// Route pour récupérer TOUS les jeux de notre catalogue
// C'est comme demander la liste complète des jeux disponibles
app.get("/api/games", (req : Request, res : Response) => {
    // On renvoie simplement le tableau games en entier
    res.json(games);
});

// Route pour récupérer le PREMIER jeu de la liste
// Utile par exemple pour afficher un jeu "à la une"
app.get("/api/games/first", (req : Request, res : Response) => {
    // games[0] accède au premier élément du tableau (les index commencent à 0)
    // games[1] serait le deuxième, games[2] le troisième, etc.
    res.json(games[0]);
});

// Route pour compter le nombre total de jeux
// Pratique pour afficher "Vous avez X jeux dans votre bibliothèque"
app.get("/api/games/count", (req : Request, res : Response) => {
    // .length est une propriété des tableaux qui retourne le nombre d'éléments
    // Si games a 5 jeux, games.length vaut 5
    res.json(
        {
            total : games.length
        }
    );
});

// Route pour récupérer les jeux "rétro" (sortis avant ou en 2000)
// Permet de filtrer pour les amateurs de jeux anciens
app.get("/api/games/retro", (req : Request, res : Response) => {
    // filter() parcourt le tableau et garde seulement les éléments qui passent le test
    // game => game.year <= 2000 est une fonction fléchée (arrow function)
    // Elle retourne true si l'année est inférieure ou égale à 2000
    const retro = games.filter(game => game.year <= 2000);
    res.json(retro);
});

// Route pour récupérer la liste de toutes les plateformes (sans doublons)
// Utile pour créer un menu déroulant de filtres par exemple
app.get("/api/games/platforms", (req : Request, res : Response) => {
    // games.map(game => game.platform) crée un tableau avec juste les plateformes
    // Ex: ["PC", "PC", "Multi-platform", "Arcade", "Nintendo 64"]

    // new Set(...) crée un Set (collection sans doublons)
    // Un Set garde seulement les valeurs uniques automatiquement
    // Ex: Set {"PC", "Multi-platform", "Arcade", "Nintendo 64"}

    // [...new Set(...)] reconvertit le Set en tableau normal avec le spread operator
    // Ex: ["PC", "Multi-platform", "Arcade", "Nintendo 64"]
    const plaforms = [...new Set(games.map(game => game.platform))];
    res.json(plaforms);
});

// On démarre le serveur ! C'est comme allumer la lumière de notre boutique
// À partir de maintenant, les gens peuvent visiter notre site
// app.listen() démarre le serveur HTTP et écoute sur le port spécifié
// Le callback est exécuté une fois que le serveur est prêt à recevoir des requêtes
// Template literal `${}` permet d'insérer des variables dans une string
app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`)
});