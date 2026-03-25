import {Book, Author, Comment} from './types';
const books: Book[] = require('./mocks/books.json');
const authors: Author[] = require('./mocks/authors.json');
const comments: Comment[] = require('./mocks/comments.json');

import {configureStore, createSlice, createSelector, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language} from './translations';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const booksSlice = createSlice({
  name: 'books',
  initialState: books,
  reducers: {},
});

const authorsSlice = createSlice({
  name: 'authors',
  initialState: authors,
  reducers: {},
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState: comments,
  reducers: {
    addComment: (state, action: PayloadAction<Comment>) => {
      state.push(action.payload);
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
    favoriteBookIds: [] as string[],
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const bookId = action.payload;
      const isFavorite = state.favoriteBookIds.includes(bookId);

      if (isFavorite) {
        state.favoriteBookIds = state.favoriteBookIds.filter(id => id !== bookId);
      } else {
        state.favoriteBookIds.push(bookId);
      }

      // Persist to AsyncStorage
      AsyncStorage.setItem(
        'favoriteBookIds',
        JSON.stringify(state.favoriteBookIds),
      );
    },
    setFavoriteBookIds: (state, action) => {
      state.favoriteBookIds = action.payload;
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
export const selectBooks = (state: RootState): Book[] => state.books;
export const selectBookById = (
  state: RootState,
  id: string,
): Book | undefined => state.books.find(book => book.id === id);

/** Authors selectors */
export const selectAuthors = (state: RootState): Author[] => state.authors;
export const selectAuthorById = (
  state: RootState,
  id: string,
): Author | undefined => state.authors.find(author => author.id === id);

/** Comments selectors */
export const selectComments = (state: RootState) => state.comments;
export const selectCommentsByBookId = createSelector(
  [selectComments, (state, bookId) => bookId],
  (allComments, bookId) =>
    Object.values(allComments).filter(comment => comment.bookId === bookId),
);
export const selectLast10CommentsByBookId = createSelector(
  [selectComments, (state, bookId) => bookId],
  (allComments, bookId) => {
    const bookComments = Object.values(allComments).filter(
      comment => comment.bookId === bookId,
    );
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
): boolean => state.favorites.favoriteBookIds.includes(bookId);
export const selectFavoriteBookIds = (state: RootState): string[] =>
  state.favorites.favoriteBookIds;
