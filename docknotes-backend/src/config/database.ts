// On importe mysql2 avec le mode "promise" pour pouvoir utiliser async/await
// mysql2 est un driver Node.js pour se connecter à une base de données MySQL
// Le mode "promise" évite les callbacks et rend le code plus lisible
import mysql from "mysql2/promise";

// On crée un "pool" de connexions - c'est comme une salle d'attente avec plusieurs guichets
// Au lieu d'ouvrir/fermer une connexion à chaque requête (coûteux en performance),
// le pool garde plusieurs connexions prêtes à l'emploi et les réutilise
const db = mysql.createPool({
    host: "localhost",           // L'adresse du serveur MySQL (ici sur notre propre machine)
    user: "root",               // Le nom d'utilisateur MySQL (root = l'administrateur)
    password: "",               // Le mot de passe (vide ici car c'est en développement local)
    database: "docknote",       // Le nom de la base de données à utiliser
    waitForConnections: true,   // Si toutes les connexions sont occupées, on attend au lieu de crasher
    connectionLimit: 10,        // Maximum 10 connexions simultanées dans le pool
    queueLimit: 0               // Pas de limite sur la file d'attente (0 = illimité)
});

// On exporte le pool pour l'utiliser dans les autres fichiers (comme index.ts)
// Grâce à "export default", on peut l'importer avec : import db from './config/database'
export default db