// On importe Express - c'est comme une boîte à outils pour créer un site web
// Express est un framework Node.js qui simplifie la création de serveurs HTTP
// Request = les infos de la demande du client, Response = ce qu'on lui renvoie
import express, {Request, Response} from 'express';

// On importe notre connexion à la base de données MySQL (configurée dans config/database.ts)
// Ce "db" est un pool de connexions qui nous permet d'exécuter des requêtes SQL
import db from '@/config/database';

// On importe ResultSetHeader de mysql2 - c'est le type TypeScript pour les résultats
// des requêtes INSERT, UPDATE, DELETE (qui ne retournent pas de lignes mais des métadonnées)
// Il contient des infos comme affectedRows (nombre de lignes modifiées) et insertId (id créé)
import { ResultSetHeader } from 'mysql2';

import categoriesRouter from "@/routes/categories.route"

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
// Une route = une URL + une méthode HTTP (GET, POST, PUT, DELETE, PATCH)
// Ces 5 méthodes correspondent au CRUD : Create (POST), Read (GET), Update (PUT/PATCH), Delete (DELETE)

// Route d'accueil : quand on va sur la racine du site "/"
// C'est la page principale, comme la porte d'entrée d'une maison
app.get("/", (req : Request, res : Response) => {
    // res.json() envoie une réponse avec Content-Type: application/json
    // et convertit automatiquement l'objet JavaScript en chaîne JSON
    res.json({
        message : "Bienvenue sur l'API de Docknotes"
    });
});

app.use("/categories", categoriesRouter);

// Ceci est une "interface" - c'est comme une fiche d'identité pour une note
// Elle dit quelles informations chaque note doit avoir obligatoirement
// TypeScript utilise les interfaces pour vérifier la forme des objets à la compilation
interface Note {
    id : string,          // Un identifiant unique pour reconnaître chaque note
    title : string,       // Le titre de la note (par exemple "Javascript")
    color : string,       // La couleur de la note pour l'affichage (ex: "red", "blue")
    content : string,     // Le contenu de la note (ce qu'on a écrit dedans)
    date : Date,          // La date de création (objet Date JavaScript)
    isFavorite : boolean  // Est-ce qu'on aime cette note ? true = oui, false = non
};

// ========== GET /notes - Récupérer toutes les notes ==========
// Toutes les données viennent de la base MySQL (plus de tableau en dur)
// Si un query parameter "title" est fourni, on filtre en base avec LIKE
// Sinon, on récupère toutes les notes
// Exemple : /notes → toutes les notes | /notes?title=javascript → filtre par contenu
app.get("/notes", async (req : Request, res : Response) => {
    // On récupère le paramètre de recherche depuis l'URL
    // req.query contient les paramètres après le ? dans l'URL
    // Ex: /notes?title=backend → req.query = { title: "backend" }
    const {title} = req.query;

    // Si un titre est fourni, on filtre directement en base de données
    // On vérifie que title existe ET que c'est une string (TypeScript safety)
    if (title && typeof title === "string") {
      // LIKE ? avec %${title}% cherche le mot n'importe où dans le contenu (% = wildcard)
      // Ex: "%backend%" trouvera "Créer un serveur backend" ou "Le backend avec Node"
      const [data] = await db.query(
        "SELECT * FROM notes WHERE content LIKE ?",
        [`%${title}%`]
      );
      res.json(data);
      return; // return arrête l'exécution pour ne pas continuer après
    }
    // Si pas de filtre, on interroge la base de données MySQL
    // db.query() retourne un tableau : [les données, les métadonnées des colonnes]
    // On déstructure avec [data] pour récupérer uniquement les données (premier élément)
    // "await" attend que la requête SQL soit terminée avant de continuer (asynchrone)
    const [data] = await db.query("SELECT * FROM notes");
    res.json(data)
});

// ========== GET /notes/:id - Récupérer UNE note par son identifiant ==========
// :id est un paramètre d'URL dynamique (route parameter)
// Exemple : /notes/1 → récupère la note avec l'id 1
// Exemple : /notes/42 → récupère la note avec l'id 42
app.get("/notes/:id", async (req : Request, res : Response) => {
    // try/catch permet de gérer les erreurs - si quelque chose plante dans le try,
    // on tombe dans le catch au lieu de crasher tout le serveur
    try {
        // req.params contient les paramètres dynamiques de l'URL
        // Pour /notes/5, req.params = { id: "5" }
        const {id} = req.params

        // On exécute une requête SQL avec un paramètre préparé (le ?)
        // Le ? est remplacé par la valeur de [id] - ça protège contre les injections SQL
        // L'injection SQL est une attaque où un pirate envoie du code SQL malveillant
        const [data] = await db.query("SELECT * FROM notes WHERE id = ?", [id]);

        // On cast (convertit) le résultat en tableau de Note[] car mysql2 retourne un type générique
        // TypeScript a besoin de savoir le type exact pour nous aider avec l'autocomplétion
        const notes = data as Note[];

        // Si le tableau est vide, la note n'existe pas → erreur 404 (Not Found)
        if(notes.length === 0){
            return res.status(404).json({message : "Note not found"});
        }

        // On renvoie la première (et seule) note trouvée
        // notes[0] car même avec WHERE id = ?, le résultat est toujours un tableau
        res.json(notes[0]);
    } catch (error) {
        // En cas d'erreur (ex: base de données inaccessible), on renvoie une erreur 500
        // 500 = Internal Server Error (problème côté serveur, pas côté client)
        res.status(500).json({message : "Error server", error});
    }
})

// ========== POST /notes - Créer une nouvelle note ==========
// app.post() crée une route qui répond aux requêtes HTTP POST
// POST est utilisé pour créer de nouvelles ressources (C de CRUD = Create)
app.post("/notes", async (req : Request, res : Response) => {
    // On récupère les données envoyées par le client dans le body de la requête
    // req.body contient les données JSON envoyées (grâce au middleware express.json())
    // La déstructuration extrait directement les propriétés qu'on veut
    const {title, color, content, isFavorite, category_id} = req.body;

    // Validation : on vérifie que les champs obligatoires sont présents
    // Si title ou content manque, on renvoie une erreur 400 (Bad Request = mauvaise demande)
    // C'est important de valider les données avant de les insérer en base !
    if(!title || !content){
        return res.status(400).json({
            message : "Les champs title et content sont obligatoires"
        });
    };

    // On insère la nouvelle note en base de données avec une requête SQL INSERT
    // Les ? sont des paramètres préparés, remplacés dans l'ordre par les valeurs du tableau
    // ResultSetHeader nous donne accès à insertId (l'id auto-généré par MySQL)
    // || fournit une valeur par défaut : si color est vide/null/undefined, on met "red"
    const [data] = await db.query<ResultSetHeader>("INSERT INTO notes (title, color, content, date, isFavorite, category_id) VALUES (?, ?, ?, ?, ?, ?)", [
        title,
        color || "red",
        content,
        new Date(),          // La date actuelle au moment de la création
        isFavorite || false,   // Par défaut, la note n'est pas en favori
        category_id || null
    ]);

    // On construit l'objet de la note créée pour le renvoyer au client
    // data.insertId contient l'id auto-incrémenté généré par MySQL lors de l'INSERT
    // On renvoie cet objet pour que le client connaisse l'id et les valeurs par défaut utilisées
    const newNote = {
        id : data.insertId,
        title,
        color : color || "red",
        content,
        date : new Date(),
        isFavorite : isFavorite || false
    };

    res.json(newNote);
});

// ========== PUT /notes/:id - Remplacer entièrement une note ==========
// app.put() crée une route qui répond aux requêtes HTTP PUT
// PUT remplace TOUTE la ressource (U de CRUD = Update complet)
// Différence avec PATCH : PUT exige TOUS les champs, PATCH accepte seulement ceux à modifier
app.put("/notes/:id", async (req : Request, res : Response) => {
    // On récupère l'id depuis l'URL et les nouvelles données depuis le body
    const {id} = req.params;
    const {title, color, content, isFavorite, category_id} = req.body;

    // Pour PUT, TOUS les champs sont obligatoires car on remplace toute la note
    // On valide que title, content ET color sont présents
    if(!title || !content || !color){
        return res.status(400).json({
            message : "Les champs title et content sont obligatoires"
        });
    };

    // On met à jour TOUS les champs de la note en base de données
    // La requête SQL UPDATE SET modifie les colonnes spécifiées WHERE id = ?
    // ?? est l'opérateur "nullish coalescing" : utilise la valeur de droite seulement si
    // la gauche est null ou undefined (contrairement à || qui réagit aussi à false, 0, "")
    // Ici c'est important car isFavorite peut valoir false (qui est une valeur valide)
    const [data] = await db.query<ResultSetHeader>("UPDATE notes SET title = ?, color = ?, content = ?, isFavorite = ?, category_id = ? WHERE id = ?", [
        title,
        color,
        content,
        isFavorite ?? false,
        category_id || null,
        id
    ]);

    // Après la mise à jour, on récupère la note modifiée depuis la base pour la renvoyer
    // Cela garantit que le client reçoit les données telles qu'elles sont en base
    const [result] = await db.query("SELECT * FROM notes WHERE id = ?", [id])
    res.json(result);

});

// ========== PATCH /notes/:id - Modifier partiellement une note ==========
// app.patch() crée une route qui répond aux requêtes HTTP PATCH
// PATCH ne modifie que les champs envoyés (mise à jour partielle)
// Exemple : envoyer { "color": "green" } ne changera que la couleur, pas le reste
app.patch("/notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, color, content, isFavorite, category_id } = req.body;

    // On construit la requête SQL dynamiquement selon les champs envoyés
    // updates contiendra les morceaux SQL comme ["title = ?", "color = ?"]
    // values contiendra les valeurs correspondantes dans le même ordre
    const updates: string[] = [];
    const values: (string | boolean | number | null)[] = [];

    // Pour chaque champ, on vérifie s'il a été envoyé dans la requête (!== undefined)
    // On utilise !== undefined plutôt que if(title) pour accepter les valeurs falsy
    // comme une string vide "" ou false, qui sont des valeurs valides à mettre à jour
    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (color !== undefined) {
      updates.push("color = ?");
      values.push(color);
    }
    if (content !== undefined) {
      updates.push("content = ?");
      values.push(content);
    }
    if (isFavorite !== undefined) {
      updates.push("isFavorite = ?");
      values.push(isFavorite);
    }
    if (category_id !== undefined){
        updates.push("category_id = ?");
        values.push(category_id);
    }

    // Si aucun champ n'a été envoyé, on renvoie une erreur 400
    // Pas besoin de faire une requête SQL si on n'a rien à modifier
    if (updates.length === 0) {
      res.status(400).json({ message: "Aucun champ à modifier" });
      return;
    }

    // On ajoute l'id à la fin du tableau values (il correspond au WHERE id = ?)
    // Number(id) convertit la string de l'URL en nombre pour MySQL
    values.push(Number(id));

    // On assemble la requête SQL en joignant les morceaux avec des virgules
    // Ex: updates = ["title = ?", "color = ?"] → "UPDATE notes SET title = ?, color = ? WHERE id = ?"
    // join(", ") transforme le tableau en string avec ", " entre chaque élément
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE notes SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // affectedRows indique combien de lignes ont été modifiées par la requête
    // Si 0 lignes affectées, c'est que l'id n'existe pas en base → erreur 404
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    // On récupère la note mise à jour pour la renvoyer au client
    // Le cast "as Note[]" indique à TypeScript le type du résultat
    // [0] récupère le premier (et seul) élément du tableau
    const [data] = await db.query("SELECT * FROM notes WHERE id = ?", [id]);
    res.json((data as Note[])[0]);
  } catch (error) {
    // En cas d'erreur serveur, on renvoie un status 500 avec le détail de l'erreur
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ========== DELETE /notes/:id - Supprimer une note ==========
// app.delete() crée une route qui répond aux requêtes HTTP DELETE
// DELETE supprime une ressource (D de CRUD = Delete)
app.delete("/notes/:id", async (req : Request, res : Response) => {
    try{
        const {id} = req.params;

        // On exécute une requête SQL DELETE pour supprimer la note avec l'id donné
        // Comme pour les autres requêtes, le ? protège contre les injections SQL
        const [data] = await db.query<ResultSetHeader>("DELETE FROM notes WHERE id = ?", [id]);

        // Si aucune ligne n'a été supprimée, la note n'existait pas → erreur 404
        if(data.affectedRows === 0){
            return res.status(404).json({
                message : "Note not found"
            });
        };

        // On renvoie le status 204 (No Content) - succès mais pas de contenu à renvoyer
        // 204 est le code standard pour une suppression réussie
        // Note : avec 204, le body est ignoré par le navigateur (même si on en envoie un)
        res.status(204).json("Note supprimé avec succès");
    } catch(error){
        res.status(500).json({message : "Error server", error});
    }
})

// ========== DÉMARRAGE DU SERVEUR ==========
// On démarre le serveur ! C'est comme allumer la lumière de notre boutique
// app.listen() démarre le serveur HTTP et écoute sur le port spécifié
// Le callback (la fonction fléchée) est exécuté une fois que le serveur est prêt
app.listen(port, async () => {
    // Template literal `${}` permet d'insérer des variables dans une string
    console.log(`Server is running on port ${port}`);

    // On teste la connexion à la base de données au démarrage
    // "SELECT 1" est une requête SQL minimale qui vérifie juste que MySQL répond
    // Si ça fonctionne, on sait que la base est accessible et prête
    try{
        
    } catch(error){
        // Si la connexion échoue, on affiche l'erreur mais le serveur continue de tourner
        // Les routes qui utilisent la base ne fonctionneront pas, mais la route "/" si
        console.log("Database connection failed:", error)
    }
});
