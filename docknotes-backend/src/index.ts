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
    },
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

// Route pour CRÉER une nouvelle note
// app.post() crée une route qui répond aux requêtes HTTP POST
// POST est utilisé pour créer de nouvelles ressources (C de CRUD = Create)
app.post("/notes", (req : Request, res : Response) => {
    // On récupère les données envoyées par le client dans le body de la requête
    // req.body contient les données JSON envoyées (grâce au middleware express.json())
    // La déstructuration extrait directement les propriétés qu'on veut
    const {title, color, content, isFavorite} = req.body;

    // Validation : on vérifie que les champs obligatoires sont présents
    // Si title ou content manque, on renvoie une erreur 400 (Bad Request)
    // C'est important de valider les données avant de les utiliser !
    if(!title || !content){
        res.status(400).json({
            message : "Les champs title et content sont obligatoires"
        });
        return  // On arrête l'exécution ici
    };

    // On crée la nouvelle note avec toutes ses propriétés
    const newNote : Note = {
        id : String(notes.length + 1),  // On génère un nouvel id (longueur du tableau + 1)
        title,                           // Raccourci ES6 : équivalent à title: title
        color : color || "red",          // Si color n'est pas fourni, on met "red" par défaut (opérateur ||)
        content,
        date : new Date(),               // On met la date actuelle
        isFavorite : isFavorite || false // Si pas fourni, false par défaut
    };

    // On ajoute la nouvelle note à notre tableau
    // push() ajoute un élément à la fin du tableau
    notes.push(newNote);

    // On renvoie la note créée avec le status 201 (Created)
    // 201 = la ressource a été créée avec succès
    res.status(201).json(newNote);
});

// Route pour REMPLACER ENTIÈREMENT une note existante
// app.put() crée une route qui répond aux requêtes HTTP PUT
// PUT remplace TOUTE la ressource (U de CRUD = Update complet)
// Différent de PATCH qui ne modifie que certains champs
app.put("/notes/:id", (req : Request, res : Response) => {
    // On récupère l'id depuis l'URL et les nouvelles données depuis le body
    const {id} = req.params;
    const {title, color, content, isFavorite} = req.body;

    // On cherche l'INDEX de la note dans le tableau (pas la note elle-même)
    // findIndex() retourne la position (0, 1, 2...) ou -1 si non trouvé
    // Différent de find() qui retourne l'élément lui-même
    const noteIndex = notes.findIndex((n) => n.id === id);

    // Si la note n'existe pas (index = -1), on renvoie 404
    if (noteIndex === -1){
        res.status(404).json({
            message : "Note not found"
        })
        return
    }

    // Pour PUT, TOUS les champs sont obligatoires (remplacement complet)
    // On valide que title, content ET color sont présents
    if(!title || !content || !color){
        res.status(400).json({
            message : "Les champs title et content sont obligatoires"
        });
        return
    };

    // On crée la note mise à jour
    // On garde l'id et la date d'origine (ils ne changent pas)
    const updateNote : Note = {
        id : notes[noteIndex].id,           // On garde l'id original
        title,
        color,
        content,
        date : notes[noteIndex].date,       // On garde la date de création originale
        isFavorite : isFavorite ?? false    // ?? = nullish coalescing : utilise false si isFavorite est null ou undefined
    };

    // On remplace l'ancienne note par la nouvelle dans le tableau
    // notes[noteIndex] accède à l'élément à la position noteIndex
    notes[noteIndex] = updateNote;

    // On renvoie la note mise à jour (status 200 par défaut)
    res.json(updateNote);

});

// Route pour MODIFIER PARTIELLEMENT une note existante
// app.patch() crée une route qui répond aux requêtes HTTP PATCH
// PATCH ne modifie que les champs envoyés (mise à jour partielle)
// Différent de PUT qui remplace TOUT l'objet
app.patch("/notes/:id", (req : Request, res : Response) => {
    const {id} = req.params;
    const {title, color, content, isFavorite} = req.body;

    // On cherche l'index de la note
    const noteIndex = notes.findIndex((n) => n.id === id);

    // Si non trouvé, erreur 404
    if(noteIndex === -1){
        return res.status(404).json({
            message : "Note not found"
        });
    }

    // On crée la note mise à jour en utilisant le spread operator (...)
    // C'est une technique avancée mais très pratique !
    const updateNote : Note = {
        ...notes[noteIndex],                              // On copie TOUTES les propriétés de la note existante
        ...(title && {title}),                            // Si title existe, on l'ajoute/remplace
        ...(color && {color}),                            // Si color existe, on l'ajoute/remplace
        ...(content && {content}),                        // Si content existe, on l'ajoute/remplace
        ...(isFavorite !== undefined && {isFavorite})     // Pour isFavorite, on vérifie !== undefined car false est une valeur valide
    };
    // Explication du spread conditionnel :
    // ...(condition && {prop}) = si la condition est vraie, on "spread" l'objet {prop}
    // Si condition est fausse, on spread "false" ce qui n'ajoute rien
    // Ça permet de ne modifier QUE les champs envoyés par le client

    notes[noteIndex] = updateNote;
    res.json(updateNote);
});

// Route pour SUPPRIMER une note
// app.delete() crée une route qui répond aux requêtes HTTP DELETE
// DELETE supprime une ressource (D de CRUD = Delete)
app.delete("/notes/:id", (req : Request, res : Response) => {
    const {id} = req.params;

    // On cherche l'index de la note à supprimer
    const noteIndex = notes.findIndex((n) => n.id === id);

    // Si non trouvé, erreur 404
    if(noteIndex === -1){
        return res.status(404).json({
            message : "Note not found"
        });
    }

    // On supprime la note du tableau
    // splice(index, nombreASupprimer) modifie le tableau en place
    // splice(noteIndex, 1) = à partir de noteIndex, supprimer 1 élément
    notes.splice(noteIndex, 1);

    // On renvoie le status 204 (No Content)
    // 204 = succès mais pas de contenu à renvoyer
    // Note : avec 204, le body est ignoré par le navigateur (même si on en envoie un)
    res.status(204).json("Note supprimé avec succès")

    // Alternative plus correcte pour 204 :
    // res.status(204).send()  // send() sans argument pour ne rien envoyer
})

// On démarre le serveur ! C'est comme allumer la lumière de notre boutique
// À partir de maintenant, les gens peuvent visiter notre site
// app.listen() démarre le serveur HTTP et écoute sur le port spécifié
// Le callback est exécuté une fois que le serveur est prêt à recevoir des requêtes
// Template literal `${}` permet d'insérer des variables dans une string
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
