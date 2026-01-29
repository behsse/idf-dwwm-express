import express, { Request, Response } from "express";
import { books } from "./data/books";
import { authors } from "./data/authors";
import { categories } from "./data/categories";
import { Book } from "./interfaces/Book.interface";
import { Author } from "./interfaces/Author.interface";
import { Category } from "./interfaces/Category.interface";

const app = express();

const PORT = 3000;

app.use(express.json());

// ========================
// Partie 3 : Routes GET basiques
// ========================

// 3.1 - Route de bienvenue
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Bienvenue dans l'API de la Librairie en ligne !" });
});

// 3.2 - Route de statut
app.get("/api/status", (_req: Request, res: Response) => {
  res.json({
    name: "API Librairie",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// 3.3 - Recuperer tous les livres
app.get("/api/books", (req: Request, res: Response) => {
  // 5.4 - Pagination
  if (req.query.page || req.query.limit) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedBooks = books.slice(startIndex, endIndex);

    return res.json({
      data: paginatedBooks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(books.length / limit),
        totalItems: books.length,
        itemsPerPage: limit,
      },
    });
  }

  // 5.5 - Tri des resultats
  if (req.query.sortBy) {
    const sortBy = req.query.sortBy as keyof Book;
    const order = (req.query.order as string) || "asc";

    const sortedBooks = [...books];

    sortedBooks.sort((a, b) => {
      if (order === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

    return res.json(sortedBooks);
  }

  // 5.6 - Filtrer par disponibilite
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === "true";
    const filtered = books.filter((b) => b.inStock === inStock);
    return res.json(filtered);
  }

  res.json(books);
});

// 3.4 - Recuperer tous les auteurs
app.get("/api/authors", (_req: Request, res: Response) => {
  res.json(authors);
});

// 3.5 - Recuperer toutes les categories
app.get("/api/categories", (_req: Request, res: Response) => {
  res.json(categories);
});

// 3.6 - Compter les livres
app.get("/api/books/count", (_req: Request, res: Response) => {
  res.json({ total: books.length });
});

// 3.7 - Premier et dernier livre
app.get("/api/books/first", (_req: Request, res: Response) => {
  res.json(books[0]);
});

app.get("/api/books/last", (_req: Request, res: Response) => {
  res.json(books[books.length - 1]);
});

// 3.8 - Livres en stock
app.get("/api/books/available", (_req: Request, res: Response) => {
  const available = books.filter((book) => book.inStock);
  res.json(available);
});

// 3.9 - Livres classiques (avant 2000)
app.get("/api/books/classics", (_req: Request, res: Response) => {
  const classics = books.filter((book) => book.year < 2000);
  res.json(classics);
});

// 3.10 - Livres bien notes
app.get("/api/books/top-rated", (_req: Request, res: Response) => {
  const topRated = books.filter((book) => book.rating >= 4);
  res.json(topRated);
});

// 3.11 - Liste des genres (sans doublons)
app.get("/api/books/genres", (_req: Request, res: Response) => {
  const genres = books.map((book) => book.genre);
  const uniqueGenres = [...new Set(genres)];
  res.json(uniqueGenres);
});

// 3.12 - Statistiques des livres
app.get("/api/books/stats", (_req: Request, res: Response) => {
  const total = books.length;
  const available = books.filter((b) => b.inStock).length;
  const unavailable = books.filter((b) => !b.inStock).length;

  const totalPrice = books.reduce((sum, book) => sum + book.price, 0);
  const averagePrice = parseFloat((totalPrice / total).toFixed(2));

  const totalRating = books.reduce((sum, book) => sum + book.rating, 0);
  const averageRating = parseFloat((totalRating / total).toFixed(2));

  const oldest = books.reduce((old, book) =>
    book.year < old.year ? book : old
  );
  const newest = books.reduce((recent, book) =>
    book.year > recent.year ? book : recent
  );

  res.json({
    total,
    available,
    unavailable,
    averagePrice,
    averageRating,
    oldestBook: oldest.title,
    newestBook: newest.title,
  });
});

// 3.13 - Auteurs vivants
app.get("/api/authors/alive", (_req: Request, res: Response) => {
  const alive = authors.filter((author) => author.isAlive);
  res.json(alive);
});

// 3.14 - Liste des nationalites
app.get("/api/authors/nationalities", (_req: Request, res: Response) => {
  const nationalities = authors.map((author) => author.nationality);
  const uniqueNationalities = [...new Set(nationalities)];
  res.json(uniqueNationalities);
});

// ========================
// Partie 5 : Routes GET avec Query Params
// ========================

// 5.1, 5.2, 5.3 - Recherche combinee (title, author, genre)
app.get("/api/books/search", (req: Request, res: Response) => {
  let results = [...books];

  if (req.query.title) {
    const title = (req.query.title as string).toLowerCase();
    results = results.filter((b) => b.title.toLowerCase().includes(title));
  }

  if (req.query.author) {
    const author = (req.query.author as string).toLowerCase();
    results = results.filter((b) => b.author.toLowerCase().includes(author));
  }

  if (req.query.genre) {
    const genre = (req.query.genre as string).toLowerCase();
    results = results.filter((b) => b.genre.toLowerCase().includes(genre));
  }

  res.json(results);
});

// ========================
// Partie 4 : Routes GET avec parametres
// ========================

// 4.4 - Livres par genre
app.get("/api/books/genre/:genre", (req: Request, res: Response) => {
  const genre = (req.params.genre as string).toLowerCase();
  const result = books.filter(
    (book) => book.genre.toLowerCase() === genre
  );
  res.json(result);
});

// 4.5 - Livres par annee
app.get("/api/books/year/:year", (req: Request, res: Response) => {
  const year = parseInt(req.params.year as string);
  const result = books.filter((book) => book.year === year);
  res.json(result);
});

// 4.9 - Verifier si un titre existe
app.get("/api/books/check/:title", (req: Request, res: Response) => {
  const title = (req.params.title as string).toLowerCase();
  const exists = books.some(
    (book) => book.title.toLowerCase() === title
  );
  res.json({ exists });
});

// 4.10 - Livres dans une fourchette de prix
app.get("/api/books/price/:min/:max", (req: Request, res: Response) => {
  const min = parseFloat(req.params.min as string);
  const max = parseFloat(req.params.max as string);
  const result = books.filter(
    (book) => book.price >= min && book.price <= max
  );
  res.json(result);
});

// 4.6 - Titre d'un livre par ID
app.get("/api/books/:id/title", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: "Livre non trouve" });
  }

  res.json({ title: book.title });
});

// 4.7 - Prix d'un livre par ID
app.get("/api/books/:id/price", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: "Livre non trouve" });
  }

  res.json({ price: book.price });
});

// 4.1 - Recuperer un livre par ID
app.get("/api/books/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: "Livre non trouve" });
  }

  res.json(book);
});

// 4.8 - Auteurs par nationalite
app.get(
  "/api/authors/nationality/:nationality",
  (req: Request, res: Response) => {
    const nationality = (req.params.nationality as string).toLowerCase();
    const result = authors.filter(
      (author) => author.nationality.toLowerCase() === nationality
    );
    res.json(result);
  }
);

// 4.2 - Recuperer un auteur par ID
app.get("/api/authors/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const author = authors.find((a) => a.id === id);

  if (!author) {
    return res.status(404).json({ message: "Auteur non trouve" });
  }

  res.json(author);
});

// 4.3 - Recuperer une categorie par ID
app.get("/api/categories/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ message: "Categorie non trouvee" });
  }

  res.json(category);
});

// ========================
// Partie 6 : Routes POST (Creation)
// ========================

// 6.5 - Ajout en lot (batch) - doit etre avant /api/books/:id
app.post("/api/books/batch", (req: Request, res: Response) => {
  const newBooks = req.body;

  if (!Array.isArray(newBooks)) {
    return res.status(400).json({
      error: "Le body doit etre un tableau de livres",
    });
  }

  let addedCount = 0;

  newBooks.forEach((bookData: Partial<Book>) => {
    if (bookData.title && bookData.author) {
      const newId =
        books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;

      const newBook: Book = {
        id: newId,
        title: bookData.title,
        author: bookData.author,
        year: bookData.year ?? 0,
        genre: bookData.genre ?? "",
        price: bookData.price ?? 0,
        inStock: bookData.inStock ?? true,
        rating: bookData.rating ?? 0,
      };

      books.push(newBook);
      addedCount++;
    }
  });

  res.status(201).json({
    message: `${addedCount} livre(s) ajoute(s) avec succes`,
    addedCount,
  });
});

// 6.6 - Dupliquer un livre
app.post("/api/books/:id/duplicate", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  const newId =
    books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;

  const duplicatedBook: Book = {
    ...book,
    id: newId,
    title: `Copie de ${book.title}`,
  };

  books.push(duplicatedBook);

  res.status(201).json(duplicatedBook);
});

// 6.1 & 6.2 - Ajouter un livre avec validation
app.post("/api/books", (req: Request, res: Response) => {
  const { title, author, year, genre, price, inStock, rating } = req.body;

  if (!title || !author || price === undefined) {
    return res.status(400).json({
      error: "Les champs title, author et price sont obligatoires",
    });
  }

  const newId =
    books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;

  const newBook: Book = {
    id: newId,
    title,
    author,
    year: year ?? 0,
    genre: genre ?? "",
    price,
    inStock: inStock ?? true,
    rating: rating ?? 0,
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

// 6.3 - Ajouter un auteur
app.post("/api/authors", (req: Request, res: Response) => {
  const { firstName, lastName, nationality, birthYear, isAlive } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({
      error: "Les champs firstName et lastName sont obligatoires",
    });
  }

  const newId =
    authors.length > 0 ? Math.max(...authors.map((a) => a.id)) + 1 : 1;

  const newAuthor: Author = {
    id: newId,
    firstName,
    lastName,
    nationality: nationality ?? "",
    birthYear: birthYear ?? 0,
    isAlive: isAlive ?? true,
  };

  authors.push(newAuthor);

  res.status(201).json(newAuthor);
});

// 6.4 - Ajouter une categorie
app.post("/api/categories", (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Le champ name est obligatoire",
    });
  }

  const newId =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.id)) + 1
      : 1;

  const newCategory: Category = {
    id: newId,
    name,
    description: description ?? "",
    bookCount: 0,
  };

  categories.push(newCategory);

  res.status(201).json(newCategory);
});

// ========================
// Partie 7 : Routes PUT (Remplacement complet)
// ========================

// 7.1 - Remplacer un livre
app.put("/api/books/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { title, author, year, genre, price, inStock, rating } = req.body;

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  if (!title || !author || price === undefined) {
    return res.status(400).json({
      error: "Tous les champs obligatoires doivent etre fournis",
    });
  }

  const updatedBook: Book = {
    id,
    title,
    author,
    year,
    genre,
    price,
    inStock,
    rating,
  };

  books[index] = updatedBook;

  res.json(updatedBook);
});

// 7.2 - Remplacer un auteur
app.put("/api/authors/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { firstName, lastName, nationality, birthYear, isAlive } = req.body;

  const index = authors.findIndex((author) => author.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Auteur non trouve" });
  }

  if (!firstName || !lastName) {
    return res.status(400).json({
      error: "Les champs firstName et lastName sont obligatoires",
    });
  }

  const updatedAuthor: Author = {
    id,
    firstName,
    lastName,
    nationality,
    birthYear,
    isAlive,
  };

  authors[index] = updatedAuthor;

  res.json(updatedAuthor);
});

// 7.3 - Remplacer une categorie
app.put("/api/categories/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { name, description, bookCount } = req.body;

  const index = categories.findIndex((category) => category.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Categorie non trouvee" });
  }

  if (!name) {
    return res.status(400).json({
      error: "Le champ name est obligatoire",
    });
  }

  const updatedCategory: Category = {
    id,
    name,
    description,
    bookCount,
  };

  categories[index] = updatedCategory;

  res.json(updatedCategory);
});

// ========================
// Partie 8 : Routes PATCH (Modification partielle)
// ========================

// 8.6 - Retirer tous les livres du stock (avant /:id pour eviter conflit)
app.patch("/api/books/clear-stock", (_req: Request, res: Response) => {
  books.forEach((book) => {
    book.inStock = false;
  });

  res.json({
    message: "Tous les livres ont ete retires du stock",
    count: books.length,
  });
});

// 8.7 - Augmenter tous les prix
app.patch("/api/books/increase-prices", (req: Request, res: Response) => {
  const { percentage } = req.body;

  if (percentage === undefined) {
    return res.status(400).json({
      error: "Le champ percentage est obligatoire",
    });
  }

  books.forEach((book) => {
    book.price = parseFloat(
      (book.price * (1 + percentage / 100)).toFixed(2)
    );
  });

  res.json({
    message: `Tous les prix ont ete augmentes de ${percentage}%`,
    count: books.length,
  });
});

// 8.3 - Basculer le stock d'un livre
app.patch("/api/books/:id/toggle-stock", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  books[index].inStock = !books[index].inStock;

  res.json({
    message: "Stock mis a jour",
    inStock: books[index].inStock,
  });
});

// 8.4 - Appliquer une reduction
app.patch("/api/books/:id/discount", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { percentage } = req.body;

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  if (percentage === undefined) {
    return res.status(400).json({
      error: "Le champ percentage est obligatoire",
    });
  }

  const newPrice = parseFloat(
    (books[index].price * (1 - percentage / 100)).toFixed(2)
  );

  books[index].price = newPrice;

  res.json({
    message: `Reduction de ${percentage}% appliquee`,
    newPrice,
  });
});

// 8.5 - Mettre a jour la note
app.patch("/api/books/:id/rating", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { rating } = req.body;

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  if (rating === undefined) {
    return res.status(400).json({
      error: "Le champ rating est obligatoire",
    });
  }

  if (rating < 0 || rating > 5) {
    return res.status(400).json({
      error: "La note doit etre entre 0 et 5",
    });
  }

  books[index].rating = rating;

  res.json({
    message: "Note mise a jour",
    rating: books[index].rating,
  });
});

// 8.1 - Modifier partiellement un livre
app.patch("/api/books/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  books[index] = {
    ...books[index],
    ...req.body,
    id,
  };

  res.json(books[index]);
});

// 8.2 - Modifier partiellement un auteur
app.patch("/api/authors/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = authors.findIndex((author) => author.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Auteur non trouve" });
  }

  authors[index] = {
    ...authors[index],
    ...req.body,
    id,
  };

  res.json(authors[index]);
});

// ========================
// Partie 9 : Routes DELETE (Suppression)
// ========================

// 9.4 - Supprimer les livres hors stock (avant /:id pour eviter conflit)
app.delete("/api/books/out-of-stock", (_req: Request, res: Response) => {
  const initialCount = books.length;
  const booksInStock = books.filter((book) => book.inStock);
  const deletedCount = initialCount - booksInStock.length;

  books.length = 0;
  books.push(...booksInStock);

  res.json({
    message: `${deletedCount} livre(s) supprime(s)`,
    remaining: books.length,
  });
});

// 9.6 - Supprimer plusieurs livres par IDs (avant /:id pour eviter conflit)
app.delete("/api/books/batch", (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({
      error: "Le champ ids doit etre un tableau",
    });
  }

  const initialCount = books.length;
  const remainingBooks = books.filter((book) => !ids.includes(book.id));
  const deletedCount = initialCount - remainingBooks.length;

  books.length = 0;
  books.push(...remainingBooks);

  res.json({
    message: `${deletedCount} livre(s) supprime(s)`,
    deletedIds: ids.filter((id: number) => !books.some((b) => b.id === id)),
  });
});

// 9.5 - Supprimer les livres anciens
app.delete("/api/books/before/:year", (req: Request, res: Response) => {
  const year = parseInt(req.params.year as string);
  const initialCount = books.length;
  const remainingBooks = books.filter((book) => book.year >= year);
  const deletedCount = initialCount - remainingBooks.length;

  books.length = 0;
  books.push(...remainingBooks);

  res.json({
    message: `${deletedCount} livre(s) publie(s) avant ${year} supprime(s)`,
    remaining: books.length,
  });
});

// 9.1 - Supprimer un livre
app.delete("/api/books/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Livre non trouve" });
  }

  const deletedBook = books[index];
  books.splice(index, 1);

  res.json({
    message: "Livre supprime avec succes",
    deletedBook,
  });
});

// 9.2 - Supprimer un auteur
app.delete("/api/authors/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = authors.findIndex((author) => author.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Auteur non trouve" });
  }

  const deletedAuthor = authors[index];
  authors.splice(index, 1);

  res.json({
    message: "Auteur supprime avec succes",
    deletedAuthor,
  });
});

// 9.3 - Supprimer une categorie
app.delete("/api/categories/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const index = categories.findIndex((category) => category.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Categorie non trouvee" });
  }

  const deletedCategory = categories[index];
  categories.splice(index, 1);

  res.json({
    message: "Categorie supprimee avec succes",
    deletedCategory,
  });
});

// ========================
// Demarrage du serveur
// ========================

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});