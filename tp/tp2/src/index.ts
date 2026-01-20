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
const port = 3000;

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
        isFavorite : false
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

// Route de test : on envoie un message et le serveur nous le renvoie
// Exemple : si on va sur /api/test/bonjour, on reçoit "bonjour" en retour
// :msg est un paramètre d'URL dynamique (route parameter)
// La fonction callback (req, res) => {} est exécutée à chaque requête sur cette route
app.get("/api/test/:msg", (req : Request, res : Response) => {
    // On récupère le message depuis l'adresse web (l'URL)
    // req.params contient tous les paramètres d'URL (ici { msg: "valeur" })
    // La déstructuration { msg } extrait directement la propriété msg
    const {msg} = req.params;

    // On renvoie le message dans une jolie boîte JSON
    // res.json() envoie une réponse avec Content-Type: application/json
    // et convertit automatiquement l'objet JavaScript en chaîne JSON
    res.json({
        message : msg
    });
});

// Route pour multiplier un nombre par 10
// Exemple : /api/multiply/5 nous donnera 50
app.get("/api/multiply/:nb", (req : Request, res : Response) => {
    // On transforme le texte en nombre
    // req.params.nb est toujours une string, Number() le convertit en number
    const nb = Number(req.params.nb);

    // Si ce n'est pas un vrai nombre, on dit qu'il y a une erreur
    // isNaN() vérifie si la valeur est "Not a Number" (ex: Number("abc") = NaN)
    // status(400) = Bad Request, indique que la requête du client est invalide
    if(isNaN(nb)) {
        res.status(400).json("Le paramètre n'est pas un nombre");
        return; // IMPORTANT : return arrête l'exécution pour ne pas continuer après l'erreur
    }

    // On fait le calcul : nombre × 10
    const result = nb * 10;

    // On envoie le résultat
    // Sans status(), Express envoie 200 (OK) par défaut
    res.json(result);
});

// Route pour chercher des jeux par leur nom
// Exemple : /api/games/search?title=mine trouvera "minecraft"
// Cette route utilise des query parameters (?clé=valeur) au lieu de route parameters (/:param)
// Les query params sont optionnels et servent souvent pour les filtres/recherches
app.get("/api/games/search", (req : Request, res : Response) => {
    // On récupère ce qu'on cherche (le titre)
    // req.query contient les paramètres après le ? dans l'URL
    // Ex: /search?title=mine&year=2020 → req.query = { title: "mine", year: "2020" }
    const {title} = req.query;

    // Si on a donné un titre à chercher...
    // On vérifie que title existe ET que c'est une string (TypeScript safety)
    // car req.query peut contenir des types variés (string, string[], undefined)
    if(title && typeof title === "string"){
        // On filtre les jeux pour garder seulement ceux qui contiennent le mot cherché
        // filter() crée un nouveau tableau avec les éléments qui passent le test
        // includes() vérifie si une string contient une sous-chaîne
        // toLowerCase() met tout en minuscules pour une recherche case-insensitive
        const filterGames = games.filter((n) => n.title.toLowerCase().includes(title.toLowerCase()));
        res.json(filterGames);
        return;
    }
    // Si on n'a rien cherché, on renvoie tous les jeux
    res.json(games);
});

// Route pour avoir des statistiques sur nos jeux
// Elle nous dit : combien de jeux on a, combien sont favoris, et quel est le plus vieux
app.get("/api/games/stats", (req : Request, res : Response) => {

    // On garde seulement les jeux favoris (ceux où isFavorite = true)
    // filter(g => g.isFavorite) garde les éléments où la condition est truthy
    const filterGamesFavorite = games.filter(g => g.isFavorite);

    // On cherche le jeu le plus ancien (celui avec la plus petite année)
    // Ancienne méthode avec sort() :

    // const oldGames = [...games].sort((a, b) => a.year - b.year)[0];
    
    // sort() trie le tableau par année croissante, [0] prend le premier (le plus ancien)
    // [...games] crée une copie pour ne pas modifier le tableau original

    // Nouvelle méthode avec reduce() :
    // reduce() parcourt le tableau et accumule une valeur
    // prev = accumulateur (valeur précédente), curr = élément courant
    // On compare les années : si curr.year < prev.year, on garde curr, sinon prev
    // C'est plus performant que sort() car on parcourt le tableau une seule fois
    const oldGames = games.reduce((prev, curr) => curr.year < prev.year ? curr : prev);

    // On envoie les statistiques
    res.json(
        {
            nb_game : games.length,                    // Le nombre total de jeux (propriété length du tableau)
            nb_game_favorite : filterGamesFavorite.length,  // Le nombre de jeux favoris
            old_game : oldGames.title                  // Le nom du jeu le plus ancien
        }
    )
});

// Route pour trouver UN jeu par son numéro (id)
// Exemple : /api/games/3 nous donnera le jeu avec l'id 3 (minecraft)
// Cette route doit être APRÈS /api/games/search et /api/games/stats
// sinon "search" ou "stats" seraient interprétés comme des :id
app.get("/api/games/:id", (req : Request, res : Response) => {
    // On récupère l'id depuis l'adresse
    const {id} = req.params;

    // On vérifie que c'est bien un nombre
    // Validation des entrées utilisateur = sécurité !
    // On renvoie 400 Bad Request si l'id n'est pas un nombre valide
    if(isNaN(Number(id))) return res.status(400).json(
        {
            message : "Le paramètre doit être un nombre"
        }
    );

    // On cherche le jeu qui a cet id dans notre liste
    // find() retourne le PREMIER élément qui satisfait la condition, ou undefined
    // Différent de filter() qui retourne un tableau de TOUS les éléments correspondants
    const game = games.find(g => g.id === Number(id));

    // Si on ne trouve pas le jeu, on dit qu'il n'existe pas (erreur 404)
    // 404 Not Found = la ressource demandée n'existe pas
    // C'est le code HTTP standard pour "pas trouvé"
    if(!game){
        res.status(404).json(
            {
                message : "Game not found"
            }
        )
    }
    // Si on l'a trouvé, on l'envoie !
    res.json(game);
});

// Route pour trouver tous les jeux d'une plateforme
// Exemple : /api/games/platform/PC nous donnera tous les jeux PC
// Route imbriquée /games/platform/:name - permet une API RESTful bien structurée
app.get("/api/games/platform/:name", (req : Request, res : Response) => {
    // On récupère le nom de la plateforme
    const {name} = req.params;

    // Si on a donné un nom de plateforme...
    // La vérification typeof est moins nécessaire ici car les route params sont toujours des strings, mais c'est une bonne pratique défensive
    if(name && typeof name === "string"){
        // On filtre pour garder seulement les jeux de cette plateforme
        // === fait une comparaison exacte (égalité stricte)
        // Contrairement à includes() qui cherche une sous-chaîne
        const filterPlatform = games.filter((n) => n.platform.toLowerCase() === name.toLowerCase());
        res.json(filterPlatform);
        return;
    }
    // Sinon on renvoie tous les jeux
    res.json(games);
});

// Route pour trouver tous les jeux sortis une certaine année
// Exemple : /api/games/year/2020 nous donnera tous les jeux de 2020
app.get("/api/games/year/:name", (req : Request, res : Response) => {
    // On récupère l'année
    // Le paramètre s'appelle "name" mais représente une année
    // En pratique, on l'appellerait plutôt :year pour plus de clarté
    const {name} = req.params;

    // Si on a donné une année...
    if(name && typeof name === "string"){
        // On filtre pour garder seulement les jeux de cette année
        // On convertit name en Number car year est un number dans l'interface
        // La comparaison === entre types différents (string vs number) serait toujours false
        const filterYear = games.filter((n) => n.year === Number(name));
        res.json(filterYear);
        return;
    }
    // Sinon on renvoie tous les jeux
    res.json(games);
});

// Route pour avoir SEULEMENT le titre d'un jeu (pas toutes les infos)
// Exemple : /api/games/1/title nous donnera juste "valorant"
// Route RESTful pour accéder à une propriété spécifique d'une ressource
// Utile pour économiser de la bande passante si on n'a besoin que d'une info
app.get("/api/games/:id/title", (req : Request, res : Response) => {
    // On récupère l'id
    const {id} = req.params;

    // On vérifie que c'est un nombre
    if(isNaN(Number(id))) return res.status(400).json(
        {
            message : "Le paramètre doit être un nombre"
        }
    );

    // On cherche le jeu
    const game = games.find(g => g.id === Number(id));

    // Si le jeu n'existe pas, on dit qu'on ne l'a pas trouvé
    // Le return est important ici pour éviter d'exécuter res.json(game.title)
    // après avoir déjà envoyé une réponse (sinon erreur "headers already sent")
    if(!game){
        return res.status(404).json(
            {
                message : "Game not found"
            }
        )
    }
    // Si on l'a trouvé, on envoie juste son titre
    // On accède à la propriété .title de l'objet game
    res.json(game.title);
});

// Route pour vérifier si un jeu existe dans notre liste
// Exemple : /api/games/check/minecraft nous dira si minecraft existe
// Route utile pour vérifier l'existence sans récupérer toutes les données
// Souvent utilisé avant de créer un nouvel élément (éviter les doublons)
app.get("/api/games/check/:title", (req : Request, res : Response) => {
    // On récupère le titre à vérifier
    const {title} = req.params;

    // On cherche si un jeu avec ce nom exact existe
    // Comparaison exacte avec === après toLowerCase()
    // String(title) est une sécurité supplémentaire (déjà une string normalement)
    const game = games.find(g => g.title.toLowerCase() === String(title).toLowerCase());

    // Si on ne trouve pas le jeu
    // On retourne un booléen dans un objet JSON
    // 404 indique que la ressource (le jeu) n'a pas été trouvée
    if(!game){
        return res.status(404).json(
            {
                check : false  // Le jeu n'existe pas
            }
        )
    } else {
        // Si on trouve le jeu
        // 200 OK est le status par défaut, mais on l'écrit explicitement pour la clarté
        res.status(200).json(
            {
                check : true   // Le jeu existe !
            }
        );
    }
});

// On démarre le serveur ! C'est comme allumer la lumière de notre boutique
// À partir de maintenant, les gens peuvent visiter notre site
// app.listen() démarre le serveur HTTP et écoute sur le port spécifié
// Le callback est exécuté une fois que le serveur est prêt à recevoir des requêtes
// Template literal `${}` permet d'insérer des variables dans une string
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`)
});
