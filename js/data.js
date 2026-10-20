/**
 * DATA.JS - Semillas y estructuras de datos iniciales
 * Cumple Ejercicio 3: Al menos 6 libros, 2 editoriales, 2 géneros, 3 autores y 3 clientes ficticios.
 * Cada libro relacionado con editorial y 1 o más autores; género opcional.
 */

// Editoriales iniciales (identificadores estables)
const INITIAL_EDITORIALES = [
  { id: "ED01", nombre: "Editorial Sudamericana" },
  { id: "ED02", nombre: "Alianza Editorial" },
  { id: "ED03", nombre: "Ediciones Minotauro" }
];

// Géneros iniciales (identificadores estables)
const INITIAL_GENEROS = [
  { id: "GEN01", nombre: "Literatura & Ficción" },
  { id: "GEN02", nombre: "Filosofía & Ensayo" },
  { id: "GEN03", nombre: "Ciencia Ficción" }
];

// Autores iniciales (identificadores estables)
const INITIAL_AUTORES = [
  { id: "AUT01", nombre: "Jorge Luis Borges" },
  { id: "AUT02", nombre: "Julio Cortázar" },
  { id: "AUT03", nombre: "Gabriel García Márquez" },
  { id: "AUT04", nombre: "Ursula K. Le Guin" }
];

// Clientes iniciales ficticios (al menos 3 clientes)
const INITIAL_CLIENTES = [
  {
    id: "CLI-001",
    nombre: "Ana Gómez",
    email: "ana.gomez@gmail.com"
  },
  {
    id: "CLI-002",
    nombre: "Carlos Martínez",
    email: "carlos.martinez@hotmail.com"
  },
  {
    id: "CLI-003",
    nombre: "Lucía Fernández",
    email: "lucia.fernandez@outlook.com"
  }
];

// Libros iniciales ficticios (al menos 6 libros)
// Cumple: relación con editorial existente, 1 o más autores, género opcional (nulo = «Sin clasificar»)
const INITIAL_LIBROS = [
  {
    id: "LIB-001",
    titulo: "Ficciones",
    isbn: "978-950-04-0001-1",
    precio: 1500.00,
    editorialId: "ED01",
    generoId: "GEN01",
    autoresIds: ["AUT01"]
  },
  {
    id: "LIB-002",
    titulo: "Rayuela",
    isbn: "978-950-04-0002-8",
    precio: 2000.00,
    editorialId: "ED01",
    generoId: "GEN01",
    autoresIds: ["AUT02"]
  },
  {
    id: "LIB-003",
    titulo: "Cien años de soledad",
    isbn: "978-84-206-0003-5",
    precio: 1800.00,
    editorialId: "ED02",
    generoId: "GEN01",
    autoresIds: ["AUT03"]
  },
  {
    id: "LIB-004",
    titulo: "Los desposeídos",
    isbn: "978-84-450-0004-2",
    precio: 1750.00,
    editorialId: "ED03",
    generoId: "GEN03",
    autoresIds: ["AUT04"]
  },
  {
    id: "LIB-005",
    titulo: "El Aleph",
    isbn: "978-950-04-0005-9",
    precio: 1600.00,
    editorialId: "ED01",
    generoId: "GEN01",
    autoresIds: ["AUT01"]
  },
  {
    id: "LIB-006",
    titulo: "Antología de la Literatura Fantástica",
    isbn: "978-84-206-0006-6",
    precio: 2200.00,
    editorialId: "ED02",
    generoId: null, // Género opcional: se mostrará como «Sin clasificar»
    autoresIds: ["AUT01", "AUT02"] // Coautoría (múltiples autores)
  }
];

