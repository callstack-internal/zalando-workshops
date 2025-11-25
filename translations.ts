export type Language = 'en' | 'de';

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // StartScreen
    performanceWorkshop: 'Performance Workshop',
    login: 'Login',

    // HomeScreen
    searchPlaceholder: 'Search by book or author',
    showing: 'Showing',
    of: 'of',
    books: 'books',
    favorites: 'favorites',
    sortBy: 'Sort by:',
    sortScore: 'Score',
    sortPopular: 'Most popular',
    sortTitle: 'Title',
    sortAuthor: 'Author',

    // BookListItem
    published: 'Published',
    lastRead: 'Last read',
    never: 'Never',
    rating: 'Rating',
    votes: 'votes',
    notRatedYet: 'Not rated yet',
    loading: 'Loading...',
    unknown: 'Unknown',

    // FavoritesScreen
    yourFavorites: 'Your Favorites',
    noFavoriteBooksYet: 'No favorite books yet',
    tapHeartToAdd: 'Tap the heart icon on any book to add it to your favorites',
    noAuthorsFound: 'No authors found',
    somethingWentWrong: 'Something went wrong loading the authors',
    booksTab: 'Books',
    authorsTab: 'Authors',
    age: 'Age',
    awards: 'Awards',
    genreMatches: 'Genre matches',
    newest: 'Newest',
    oldest: 'Oldest',

    // SettingsScreen
    settings: 'Settings',
    showDebugFAB: 'Show Debug FAB',
    language: 'Language',
    english: 'English',
    german: 'German',

    // Navigation headers
    booksHeader: 'Books',
    favoriteBooksAndAuthors: 'Favorite books and authors',
  },
  de: {
    // StartScreen
    performanceWorkshop: 'Performance-Workshop',
    login: 'Anmelden',

    // HomeScreen
    searchPlaceholder: 'Nach Buch oder Autor suchen',
    showing: 'Zeige',
    of: 'von',
    books: 'Bücher',
    favorites: 'Favoriten',
    sortBy: 'Sortieren nach:',
    sortScore: 'Bewertung',
    sortPopular: 'Am beliebtesten',
    sortTitle: 'Titel',
    sortAuthor: 'Autor',

    // BookListItem
    published: 'Veröffentlicht',
    lastRead: 'Zuletzt gelesen',
    never: 'Nie',
    rating: 'Bewertung',
    votes: 'Stimmen',
    notRatedYet: 'Noch nicht bewertet',
    loading: 'Laden...',
    unknown: 'Unbekannt',

    // FavoritesScreen
    yourFavorites: 'Ihre Favoriten',
    noFavoriteBooksYet: 'Noch keine Lieblingsbücher',
    tapHeartToAdd: 'Tippen Sie auf das Herzsymbol bei einem Buch, um es zu Ihren Favoriten hinzuzufügen',
    noAuthorsFound: 'Keine Autoren gefunden',
    somethingWentWrong: 'Beim Laden der Autoren ist ein Fehler aufgetreten',
    booksTab: 'Bücher',
    authorsTab: 'Autoren',
    age: 'Alter',
    awards: 'Auszeichnungen',
    genreMatches: 'Genre-Übereinstimmungen',
    newest: 'Neueste',
    oldest: 'Älteste',

    // SettingsScreen
    settings: 'Einstellungen',
    showDebugFAB: 'Debug-Button anzeigen',
    language: 'Sprache',
    english: 'Englisch',
    german: 'Deutsch',

    // Navigation headers
    booksHeader: 'Bücher',
    favoriteBooksAndAuthors: 'Lieblingsbücher und -autoren',
  },
};
