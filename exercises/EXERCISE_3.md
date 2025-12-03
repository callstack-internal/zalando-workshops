# Exercise 3: Speed up adding to favorites

## Exercise overview
- Estimated time: 30mins
- Tools required: Javascript

## Learning objectives
- Learn how to use the JavaScript profiler
- Understand different ways to access the data in JavaScript
- Identify performance bottlenecks in JavaScript thread

## Prerequisites

- Android app running

## Background

Recently PR reducing the rerenders when adding to favorites was merged. However, the monitoring tool indicates that the metric time did not change.

## Objective

Reduce the time of adding the book to favorites.

## Reproduction steps
### Enable the performance tab:
1. **Start the Metro server**
   ```bash
   npm run start
   ```

2. Open your browser's developer tools (`j` in Metro)
3. Press the "Settings" icon in the top right corner
4. Go to "Experiments"
5. Check "[React Native] Enable Performance panel
6. Re-run the React Native DevTools
7. In the opened DevTools window, click on the "Performance" tab

### 
1. Open the app (cold start)
2. Login into the app
3. Start recording in Chrome DevTools
4. Mark a book as a favorite
5. Stop recording once it is added to favorites
6. Download the profile trace

## Baseline

1. Open https://www.speedscope.app/
2. Upload recorded profile trace
3. Analyze the output
4. **Baseline**: Note down the time spent JS thread being blocked by the action
5. **Baseline**: Note down the `toggle-favorite` result


## The fix
Normalize the data to avoid loops heavy loops on big arrays.

<details>
  <summary>Solution</summary>
  
  1. Apply the following diff
  ```diff
diff --git a/screens/FavoritesScreen.tsx b/screens/FavoritesScreen.tsx
index 5ab5a8f..f660680 100644
--- a/screens/FavoritesScreen.tsx
+++ b/screens/FavoritesScreen.tsx
@@ -2,13 +2,11 @@ import React, {useMemo, useState} from 'react';
 import {View, Text, FlatList, StyleSheet} from 'react-native';
 import TabView, {SceneMap} from 'react-native-bottom-tabs';
 import {useAppSelector, useTranslation} from '../hooks';
-import {selectBooks, selectAuthors} from '../store';
+import {selectBooks, selectAuthors, selectFavoriteBookIds} from '../store';
 import BookListItem from '../components/BookListItem';
 
 const BooksRoute = () => {
-  const favoriteBookIds = useAppSelector(
-    state => state.favorites.favoriteBookIds,
-  );
+  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
   const {t} = useTranslation();
 
   if (favoriteBookIds.length === 0) {
@@ -34,9 +32,7 @@ const BooksRoute = () => {
 };
 
 const AuthorsRoute = () => {
-  const favoriteBookIds = useAppSelector(
-    state => state.favorites.favoriteBookIds,
-  );
+  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
   const books = useAppSelector(selectBooks);
   const authors = useAppSelector(selectAuthors);
   const {t} = useTranslation();
@@ -332,9 +328,7 @@ const renderScene = SceneMap({
 });
 
 const FavoritesScreen = () => {
-  const favoriteBookIds = useAppSelector(
-    state => state.favorites.favoriteBookIds,
-  );
+  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
   const {t} = useTranslation();
 
   const [index, setIndex] = useState(0);
diff --git a/screens/HomeScreen.tsx b/screens/HomeScreen.tsx
index 3719b39..d7040ee 100644
--- a/screens/HomeScreen.tsx
+++ b/screens/HomeScreen.tsx
@@ -8,7 +8,7 @@ import {
   TouchableOpacity,
 } from 'react-native';
 import {useAppSelector, useTranslation} from '../hooks';
-import {selectBooks, selectAuthors} from '../store';
+import {selectBooksById, selectBookIds, selectAuthorsById, selectFavoriteBookIds} from '../store';
 import BookListItem from '../components/BookListItem';
 import performanceUtils from '../performance-utils';
 
@@ -17,13 +17,12 @@ type SortKey = 'score' | 'popular' | 'title' | 'author';
 export default function HomeScreen() {
   const [search, setSearch] = useState('');
   const [sortBy, setSortBy] = useState<SortKey>('score');
-  const books = useAppSelector(selectBooks);
-  const authors = useAppSelector(selectAuthors);
+  const booksById = useAppSelector(selectBooksById);
+  const bookIds = useAppSelector(selectBookIds);
+  const authorsById = useAppSelector(selectAuthorsById);
   const {t} = useTranslation();
 
-  const favoriteBookIds = useAppSelector(
-    state => state.favorites.favoriteBookIds,
-  );
+  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
 
   // Stop measuring navigation performance when HomeScreen mounts
   useEffect(() => {
@@ -40,21 +39,13 @@ export default function HomeScreen() {
     [t],
   );
 
-  const authorsById = useMemo(() => {
-    const map: Record<string, string> = {};
-    authors.forEach(author => {
-      map[author.id] = author.name;
-    });
-    return map;
-  }, [authors]);
-
   const favoritesProcessingData = useMemo(() => {
     const favoriteBooks = favoriteBookIds
-      .map(id => books.find(book => book.id === id))
+      .map(id => booksById[id])
       .filter(Boolean);
 
     const favoriteAuthors = favoriteBooks.map(book => {
-      const author = authors.find(a => a.id === book?.authorId);
+      const author = authorsById[book?.authorId];
       return author?.name
         .toLowerCase()
         .split('')
@@ -70,23 +61,27 @@ export default function HomeScreen() {
     };
 
     return {favoriteBooks, favoriteAuthors, favoriteStats};
-  }, [favoriteBookIds, books, authors]);
+  }, [favoriteBookIds, booksById, authorsById]);
 
   const filteredBookIds = useMemo(() => {
     performanceUtils.start('search-filter');
 
     const trimmedSearch = search.trim().toLowerCase();
-    const filteredBooks = trimmedSearch
-      ? books.filter(book => {
-          const authorName = authorsById[book.authorId] ?? '';
+    const filteredIds = trimmedSearch
+      ? bookIds.filter(id => {
+          const book = booksById[id];
+          const authorName = authorsById[book.authorId]?.name ?? '';
           return (
             book.title.toLowerCase().includes(trimmedSearch) ||
             authorName.toLowerCase().includes(trimmedSearch)
           );
         })
-      : books;
+      : bookIds;
+
+    const sortedIds = [...filteredIds].sort((aId, bId) => {
+      const a = booksById[aId];
+      const b = booksById[bId];
 
-    const sortedBooks = [...filteredBooks].sort((a, b) => {
       switch (sortBy) {
         case 'popular':
           if (b.votes !== a.votes) {
@@ -96,8 +91,8 @@ export default function HomeScreen() {
         case 'title':
           return a.title.localeCompare(b.title);
         case 'author':
-          return (authorsById[a.authorId] ?? '').localeCompare(
-            authorsById[b.authorId] ?? '',
+          return (authorsById[a.authorId]?.name ?? '').localeCompare(
+            authorsById[b.authorId]?.name ?? '',
           );
         case 'score':
         default:
@@ -109,18 +104,18 @@ export default function HomeScreen() {
     });
 
     performanceUtils.stop('search-filter');
-    return sortedBooks.map(book => book.id);
-  }, [search, books, authorsById, sortBy]);
+    return sortedIds;
+  }, [search, bookIds, booksById, authorsById, sortBy]);
 
   const bookStats = useMemo(() => {
     const stats = {
-      total: books.length,
+      total: bookIds.length,
       filtered: filteredBookIds.length,
       searchActive: !!search.trim(),
       favorites: favoritesProcessingData.favoriteStats.count,
     };
     return stats;
-  }, [books, filteredBookIds, search, favoritesProcessingData]);
+  }, [bookIds, filteredBookIds, search, favoritesProcessingData]);
 
   return (
     <View
diff --git a/store.ts b/store.ts
index 415b363..e52f119 100644
--- a/store.ts
+++ b/store.ts
@@ -3,31 +3,57 @@ const books: Book[] = require('./mocks/books.json');
 const authors: Author[] = require('./mocks/authors.json');
 const comments: Comment[] = require('./mocks/comments.json');
 
-import {configureStore, createSlice, createSelector, PayloadAction} from '@reduxjs/toolkit';
+import {configureStore, createSlice, createSelector, PayloadAction, createEntityAdapter} from '@reduxjs/toolkit';
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import {Language} from './translations';
 
 export type RootState = ReturnType<typeof store.getState>;
 export type AppDispatch = typeof store.dispatch;
 
+// Create entity adapters
+const booksAdapter = createEntityAdapter<Book>();
+
+const authorsAdapter = createEntityAdapter<Author>();
+
+const commentsAdapter = createEntityAdapter<Comment>();
+
+// Build byBookId index for fast comment lookups
+const commentsByBookId: Record<string, string[]> = {};
+comments.forEach(comment => {
+  if (!commentsByBookId[comment.bookId]) {
+    commentsByBookId[comment.bookId] = [];
+  }
+  commentsByBookId[comment.bookId].push(comment.id);
+});
+
+// Initialize with normalized data
 const booksSlice = createSlice({
   name: 'books',
-  initialState: books,
+  initialState: booksAdapter.getInitialState({}, books),
   reducers: {},
 });
 
 const authorsSlice = createSlice({
   name: 'authors',
-  initialState: authors,
+  initialState: authorsAdapter.getInitialState({}, authors),
   reducers: {},
 });
 
 const commentsSlice = createSlice({
   name: 'comments',
-  initialState: comments,
+  initialState: commentsAdapter.getInitialState({
+    byBookId: commentsByBookId,
+  }, comments),
   reducers: {
     addComment: (state, action: PayloadAction<Comment>) => {
-      state.push(action.payload);
+      const comment = action.payload;
+      commentsAdapter.addOne(state, comment);
+
+      // Update byBookId index
+      if (!state.byBookId[comment.bookId]) {
+        state.byBookId[comment.bookId] = [];
+      }
+      state.byBookId[comment.bookId].push(comment.id);
     },
   },
 });
@@ -60,27 +86,32 @@ const settingsSlice = createSlice({
 const favoritesSlice = createSlice({
   name: 'favorites',
   initialState: {
-    favoriteBookIds: [] as string[],
+    favoriteBookIds: {} as Record<string, true>,
   },
   reducers: {
     toggleFavorite: (state, action) => {
       const bookId = action.payload;
-      const isFavorite = state.favoriteBookIds.includes(bookId);
+      const isFavorite = state.favoriteBookIds[bookId];
 
       if (isFavorite) {
-        state.favoriteBookIds = state.favoriteBookIds.filter(id => id !== bookId);
+        delete state.favoriteBookIds[bookId];
       } else {
-        state.favoriteBookIds.push(bookId);
+        state.favoriteBookIds[bookId] = true;
       }
 
-      // Persist to AsyncStorage
+      // Persist to AsyncStorage (convert to array for storage)
       AsyncStorage.setItem(
         'favoriteBookIds',
-        JSON.stringify(state.favoriteBookIds),
+        JSON.stringify(Object.keys(state.favoriteBookIds)),
       );
     },
     setFavoriteBookIds: (state, action) => {
-      state.favoriteBookIds = action.payload;
+      // Convert array to object for O(1) lookups
+      const ids = action.payload as string[];
+      state.favoriteBookIds = {};
+      ids.forEach(id => {
+        state.favoriteBookIds[id] = true;
+      });
     },
   },
 });
@@ -100,32 +131,41 @@ export const store = configureStore({
 });
 
 /** Books selectors */
-export const selectBooks = (state: RootState): Book[] => state.books;
-export const selectBookById = (
-  state: RootState,
-  id: string,
-): Book | undefined => state.books.find(book => book.id === id);
+// Get entity adapter selectors
+const booksSelectors = booksAdapter.getSelectors<RootState>(state => state.books);
+export const selectBooks = booksSelectors.selectAll;
+export const selectBookById = booksSelectors.selectById;
+// Export raw selectors for component-level optimization
+export const selectBooksById = (state: RootState) => state.books.entities;
+export const selectBookIds = (state: RootState) => state.books.ids;
 
 /** Authors selectors */
-export const selectAuthors = (state: RootState): Author[] => state.authors;
-export const selectAuthorById = (
-  state: RootState,
-  id: string,
-): Author | undefined => state.authors.find(author => author.id === id);
+const authorsSelectors = authorsAdapter.getSelectors<RootState>(state => state.authors);
+export const selectAuthors = authorsSelectors.selectAll;
+export const selectAuthorById = authorsSelectors.selectById;
+// Export raw selectors for component-level optimization
+export const selectAuthorsById = (state: RootState) => state.authors.entities;
 
 /** Comments selectors */
-export const selectComments = (state: RootState) => state.comments;
+const commentsSelectors = commentsAdapter.getSelectors<RootState>(state => state.comments);
+export const selectComments = commentsSelectors.selectAll;
+
+// Optimized selector using byBookId index - O(1) lookup instead of filtering
 export const selectCommentsByBookId = createSelector(
-  [selectComments, (state, bookId) => bookId],
-  (allComments, bookId) =>
-    Object.values(allComments).filter(comment => comment.bookId === bookId),
+  [
+    (state: RootState) => state.comments.entities,
+    (state: RootState) => state.comments.byBookId,
+    (_state: RootState, bookId: string) => bookId,
+  ],
+  (commentsById, byBookIdIndex, bookId) => {
+    const commentIds = byBookIdIndex[bookId] || [];
+    return commentIds.map(id => commentsById[id]);
+  },
 );
+
 export const selectLast10CommentsByBookId = createSelector(
-  [selectComments, (state, bookId) => bookId],
-  (allComments, bookId) => {
-    const bookComments = Object.values(allComments).filter(
-      comment => comment.bookId === bookId,
-    );
+  [selectCommentsByBookId],
+  (bookComments) => {
     return bookComments.slice(-10);
   },
 );
@@ -144,6 +184,8 @@ export const selectLanguage = (state: RootState): Language =>
 export const selectIsBookFavorite = (
   state: RootState,
   bookId: string,
-): boolean => state.favorites.favoriteBookIds.includes(bookId);
+): boolean => state.favorites.favoriteBookIds[bookId] === true;
+
+// Return array of favorite IDs for compatibility
 export const selectFavoriteBookIds = (state: RootState): string[] =>
-  state.favorites.favoriteBookIds;
+  Object.keys(state.favorites.favoriteBookIds);

  ```
</details>

## Verification

- Re-run the same measurement tests
- Analyze the profile trace. What changed?
- Record new metrics and compare with the baseline:
    - `toggle-favorite` for the same item
    - Time spent in JS thread being blocked by the action (x % improvement/regression)