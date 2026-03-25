# Exercise 2: Find and remove unnecessary re-renders

## Exercise overview
- Estimated time: 30mins
- Tools required: React Native DevTools

## Learning objectives
- Learn how to use the React DevTools Profiler
- Understand the concept of component re-renders and their performance impact
- Identify performance bottlenecks in state updates

## Prerequisites

- iOS or Android app running
- Basic understanding of React component lifecycle

## Background

Recently PR introducing adding to favorites was merged. Logs from monitoring tool indicate that average time of adding a book to favorite is 200ms on Android, which looks suprisingly high for such simple action.

## Objective

Reduce the time of adding the book to favorites.

## Reproduction steps
1. **Start the Metro server**
   ```bash
   npm run start
   ```

2. Open your browser's developer tools (`j` in Metro)
3. Click on the "Profiler ⚛️" tab
4. Make sure "Record why each component rendered" is enabled (gear icon → Profiler)
5. Login into the app
6. Start a new recording in the Profiler
7. Click the heart icon on one book to add it to favorites
8. Wait 2-3 seconds for any async operations to complete
9. Stop recording

## Baseline

Analyze the profiler results. Look for the following in the profiler:
1. **Component Re-renders**
   - Which components re-rendered when you clicked the heart?
   - How many times did `BookListItem` components re-render?
   - Did the `HomeScreen` component re-render?

2. **Render Duration**
   - What was the total time for the favorite action?
   - Which component took the longest to render?
   - Were there any components that rendered multiple times?

3. **Render Reasons**
   - Click on individual components to see why they rendered
   - Look for "Props changed", "State changed", "Context changed"
4. **Baseline**: Note down the recorded commmit time
5. **Baseline**: Note down the `toggle-favorite` metric and ID of the item

## The fix
Narrow down the re-renders to a single item of the list.

<details>
  <summary>Solution</summary>
  
  1. Remove the `favoriteBookIds`:
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