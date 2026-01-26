// Ceci est une "interface" - c'est comme une fiche d'identité pour un jeu vidéo
// Elle dit quelles informations chaque jeu doit avoir obligatoirement

export interface Game {
    id : number,          // Un numéro unique pour reconnaître chaque jeu (comme un numéro de badge)
    title : string,       // Le nom du jeu (par exemple "Minecraft")
    platform : string,    // Sur quoi on joue (PC, console, etc.)
    year : number,        // L'année où le jeu est sorti
    isFavorite : boolean  // Est-ce qu'on aime ce jeu ? true = oui, false = non
}
