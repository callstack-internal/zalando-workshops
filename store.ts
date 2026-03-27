import {Book, Author, Comment} from './types';
const books: Book[] = require('./mocks/books.json');
const authors: Author[] = require('./mocks/authors.json');
const comments: Comment[] = require('./mocks/comments.json');

import {configureStore, createSlice, createSelector, PayloadAction, createEntityAdapter} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language} from './translations';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create entity adapters
const booksAdapter = createEntityAdapter<Book>();

const authorsAdapter = createEntityAdapter<Author>();

const commentsAdapter = createEntityAdapter<Comment>();

// Build byBookId index for fast comment lookups
const commentsByBookId: Record<string, string[]> = {};
comments.forEach(comment => {
  if (!commentsByBookId[comment.bookId]) {
    commentsByBookId[comment.bookId] = [];
  }
  commentsByBookId[comment.bookId].push(comment.id);
});

// Initialize with normalized data
const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState({}, books),
  reducers: {},
});

const authorsSlice = createSlice({
  name: 'authors',
  initialState: authorsAdapter.getInitialState({}, authors),
  reducers: {},
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState: commentsAdapter.getInitialState({
    byBookId: commentsByBookId,
  }, comments),
  reducers: {
    addComment: (state, action: PayloadAction<Comment>) => {
      const comment = action.payload;
      commentsAdapter.addOne(state, comment);

      // Update byBookId index
      if (!state.byBookId[comment.bookId]) {
        state.byBookId[comment.bookId] = [];
      }
      state.byBookId[comment.bookId].push(comment.id);
    },
  },
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    devPanelEnabled: false,
    fabEnabled: false,
    language: 'en' as Language,
  },
  reducers: {
    toggleDevPanel: state => {
      state.devPanelEnabled = !state.devPanelEnabled;
    },
    toggleFab: state => {
      state.fabEnabled = !state.fabEnabled;
      AsyncStorage.setItem('fabEnabled', JSON.stringify(state.fabEnabled));
    },
    setFabEnabled: (state, action) => {
      state.fabEnabled = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      AsyncStorage.setItem('language', action.payload);
    },
  },
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favoriteBookIds: {} as Record<string, true>,
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const bookId = action.payload;
      const isFavorite = state.favoriteBookIds[bookId];

      if (isFavorite) {
        delete state.favoriteBookIds[bookId];
      } else {
        state.favoriteBookIds[bookId] = true;
      }

      // Persist to AsyncStorage (convert to array for storage)
      AsyncStorage.setItem(
        'favoriteBookIds',
        JSON.stringify(Object.keys(state.favoriteBookIds)),
      );
    },
    setFavoriteBookIds: (state, action) => {
      // Convert array to object for O(1) lookups
      const ids = action.payload as string[];
      state.favoriteBookIds = {};
      ids.forEach(id => {
        state.favoriteBookIds[id] = true;
      });
    },
  },
});

export const {toggleDevPanel, toggleFab, setFabEnabled, setLanguage} = settingsSlice.actions;
export const {toggleFavorite, setFavoriteBookIds} = favoritesSlice.actions;
export const {addComment} = commentsSlice.actions;

export const store = configureStore({
  reducer: {
    books: booksSlice.reducer,
    authors: authorsSlice.reducer,
    comments: commentsSlice.reducer,
    settings: settingsSlice.reducer,
    favorites: favoritesSlice.reducer,
  },
});

/** Books selectors */
// Get entity adapter selectors
const booksSelectors = booksAdapter.getSelectors<RootState>(state => state.books);
export const selectBooks = booksSelectors.selectAll;
export const selectBookById = booksSelectors.selectById;
// Export raw selectors for component-level optimization
export const selectBooksById = (state: RootState) => state.books.entities;
export const selectBookIds = (state: RootState) => state.books.ids;

/** Authors selectors */
const authorsSelectors = authorsAdapter.getSelectors<RootState>(state => state.authors);
export const selectAuthors = authorsSelectors.selectAll;
export const selectAuthorById = authorsSelectors.selectById;
// Export raw selectors for component-level optimization
export const selectAuthorsById = (state: RootState) => state.authors.entities;

/** Comments selectors */
const commentsSelectors = commentsAdapter.getSelectors<RootState>(state => state.comments);
export const selectComments = commentsSelectors.selectAll;

// Optimized selector using byBookId index - O(1) lookup instead of filtering
export const selectCommentsByBookId = createSelector(
  [
    (state: RootState) => state.comments.entities,
    (state: RootState) => state.comments.byBookId,
    (_state: RootState, bookId: string) => bookId,
  ],
  (commentsById, byBookIdIndex, bookId) => {
    const commentIds = byBookIdIndex[bookId] || [];
    return commentIds.map(id => commentsById[id]);
  },
);

export const selectLast10CommentsByBookId = createSelector(
  [selectCommentsByBookId],
  (bookComments) => {
    return bookComments.slice(-10);
  },
);

/** Settings selectors */
export const selectDevPanelEnabled = (state: RootState): boolean =>
  state.settings.devPanelEnabled;

export const selectFabEnabled = (state: RootState): boolean =>
  state.settings.fabEnabled;

export const selectLanguage = (state: RootState): Language =>
  state.settings.language;

/** Favorites selectors */
export const selectIsBookFavorite = (
  state: RootState,
  bookId: string,
): boolean => state.favorites.favoriteBookIds[bookId] === true;

// Return array of favorite IDs for compatibility
export const selectFavoriteBookIds = (state: RootState): string[] =>
  Object.keys(state.favorites.favoriteBookIds);
