# Exercise 2: Speed up adding to favorites

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
interface BookListItemProps {
    id: string;
-   favoriteBookIds: string[];
}

-   const BookListItem = ({id, favoriteBookIds}: BookListItemProps) => {
+   const BookListItem = ({id}: BookListItemProps) => {
  ```
  2. Use selector to determine if a book is in favorites 
  ```diff
-  const isFavorite = useMemo(() => {
-    const isBookFavorite = favoriteBookIds.includes(id);
-
-    return isBookFavorite;
-  }, [favoriteBookIds, id]);
+  const isFavorite = useAppSelector(state => selectIsBookFavorite(state, id));
  ```
  3. Remove all remaining occurrences of `favoriteBookIds` props in `BookListItem` calls
</details>

## Verification

- Re-run the same measurement tests
- Analyze the profile trace. What changed?
- Record new metrics and compare with the baseline:
    - `toggle-favorite` for the same item
    - Commit time (x % improvement/regression)