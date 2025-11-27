# Exercise 6: Hermes gotchas

## Exercise overview
- Estimated time: 1h
- Tools required: JavaScript profiler, Flashlight

## Learning objectives
- Identify Hermes-specific manipulation bottlenecks
- Learn to optimize string sorting
- Optimize large list rendering
- Distinguish between JS and UI thread bottlenecks: Use profiling tools to differentiate between slow JavaScript logic (sorting algorithms) and slow UI rendering (list virtualization).

## Prerequisites

- Android app running

## Background

Monitoring tool indicates that `sort-title` and `sort-author` metrics are way slower than `sort-popular` and `sort-score`. The result of sorting for those functions seems to be even 100 times slower during the single session.

## Objective

1. Make the switch between sorts smooth
2. Optimize the sorting mechanism so all the sorts are similarly efficient.

## Reproduction steps

1. Open the app
2. Login into the app
3. Press "Most Popular"
4. Press "Title"
5. Verify the list loaded

## Baseline

### Metrics
1. Open the app (cold start)
2. Open React Devtools -> Console
3. Login into the app
4. Press "Most Popular"
5. **Baseline**: Note down the `sort-popular` metric
6. Press "Title"
7. **Baseline**: Note down the `sort-title` metric
8. Press "Author"
9. **Baseline**: Note down the `sort-author` metric

### Flashlight & Maestro
1. In `flows/` create the Maestro flow that runs the app, logs into the app, clicks "Title" and asserts visibility of "1984"

<details>
  <summary>Maestro test available here</summary>
  

  ```
    appId: com.performanceworkshops
    ---
    - launchApp
    - assertVisible: "Login"
    - tapOn: "Login"
    - assertVisible: "Books"
    - tapOn: "Title"
    - assertVisible: "1984"
```
</details>
2. Build the app in release mode
3. Run the automated flashlight measurements and save the results to the file:
```shell
flashlight test --bundleId com.performanceworkshops --testCommand "maestro test flows/<flow-name>.yml" --resultsFilePath baseline.json --iterationCount 3
```
## The Fix - Part 1

Migrate from Flatlist to LegendList

<details>
  <summary>Solution</summary>
  
1. Install the Legend list:
 ```
 npm install @legendapp/list
 ```

2.  Replace `FlatList` in `HomeScreen` with `LegendList`:

```
-import React, {useState, useMemo, useEffect} from 'react';
+import React, {useState, useMemo, useEffect, useRef} from 'react';
 import {
   View,
   Text,
-  FlatList,
   TextInput,
   StyleSheet,
   TouchableOpacity,
@@ -11,6 +10,8 @@ import {useAppSelector, useTranslation} from '../hooks';
 import {selectBooksById, selectBookIds, selectAuthorsById, selectFavoriteBookIds} from '../store';
 import BookListItem from '../components/BookListItem';
 import performanceUtils from '../performance-utils';
+import { LegendList, LegendListRef } from '@legendapp/list';
 
 type SortKey = 'score' | 'popular' | 'title' | 'author';
 
@@ -21,6 +22,7 @@ export default function HomeScreen() {
   const bookIds = useAppSelector(selectBookIds);
   const authorsById = useAppSelector(selectAuthorsById);
   const {t} = useTranslation();
+  const listRef = useRef<LegendListRef>(null);
 
   const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
 
@@ -29,6 +31,10 @@ export default function HomeScreen() {
     performanceUtils.stop('app-login');
   }, []);
 
+  useEffect(() => {
+    listRef.current?.scrollToIndex({index: 0, animated: false});
+  }, [sortBy]);
+

@@ -161,14 +168,15 @@ export default function HomeScreen() {
           })}
         </View>
       </View>
-      <FlatList
+      <LegendList
+        ref={listRef}
         data={filteredBookIds}
         renderItem={({item}) => (
           <BookListItem id={item}/>
         )}
-        keyExtractor={item => item}
+        keyExtractor={(item, index) => index.toString()}
         contentContainerStyle={{paddingVertical: 8}}
-        initialNumToRender={500}
+        recycleItems
       />
     </View>
   );
```
3. Remove the unsupported props
4. Add `recycleItems` prop
</details>

## Validation - Metrics
1. Open React Devtools -> Performance
2. Login into the app
3. Press "Most Popular"
4. **Compare**: `sort-popular` metric (ms, % improvement)
6. Start profiling
7. Press "Title"
8. Stop profiling once the list reloaded
9. Download the recorded profile
10. **Compare**: `sort-title` metric (ms, % improvement)
11. Press "Author"
12. **Compare**: `sort-author` metric (ms, % improvement)

## Validation - Flashlight
1. Build the app in the release mode
2. Run the automated flashlight measurements and save the results to another file:
```shell
flashlight test --bundleId com.performanceworkshops --testCommand "maestro test flows/<flow-name>.yml" --resultsFilePath results-1.json --iterationCount 3
```

## The fix - Part 2
1. Create custom function that uses a single instance of Intl.Collator

<details>
  <summary>Solution</summary>
  
  Create a single Intl.Collator instance
  ```diff
  diff --git a/screens/HomeScreen.tsx b/screens/HomeScreen.tsx
index d7040ee..07a1577 100644
--- a/screens/HomeScreen.tsx
+++ b/screens/HomeScreen.tsx
@@ -11,6 +11,7 @@ import {useAppSelector, useTranslation} from '../hooks';
 import {selectBooksById, selectBookIds, selectAuthorsById, selectFavoriteBookIds} from '../store';
 import BookListItem from '../components/BookListItem';
 import performanceUtils from '../performance-utils';
+import {localeCompare} from '../stringUtils';
 
 type SortKey = 'score' | 'popular' | 'title' | 'author';
 
@@ -89,9 +90,10 @@ export default function HomeScreen() {
           }
           return b.rating - a.rating;
         case 'title':
-          return a.title.localeCompare(b.title);
+          return localeCompare(a.title, b.title);
         case 'author':
-          return (authorsById[a.authorId]?.name ?? '').localeCompare(
+          return localeCompare(
+            authorsById[a.authorId]?.name ?? '',
             authorsById[b.authorId]?.name ?? '',
           );
         case 'score':
diff --git a/stringUtils.ts b/stringUtils.ts
new file mode 100644
index 0000000..eceb7f6
--- /dev/null
+++ b/stringUtils.ts
@@ -0,0 +1,10 @@
+// Create a single Intl.Collator instance for efficient string comparisons
+const collator = new Intl.Collator('en', {usage: 'sort'});
+
+/**
+ * Optimized string comparison using a shared Intl.Collator instance.
+ * More performant than String.prototype.localeCompare() when called repeatedly.
+ */
+export const localeCompare = (a: string, b: string): number => {
+  return collator.compare(a, b);
+};

  ```
</details>


## Validation - Metrics

1. Open React Devtools -> Console
2. Login into the app
3. Press "Most Popular"
4. **Compare**: `sort-popular` metric (ms, % improvement)
5. Press "Title"
6. **Compare**: `sort-title` metric (ms, % improvement)
7. Press "Author"
8. **Compare**: `sort-author` metric (ms, % improvement)

## Validation - Flashlight
1. Build the app in release mode
2. Run the automated flashlight measurements and save the results to another file:
```shell
flashlight test --bundleId com.performanceworkshops --testCommand "maestro test flows/<flow-name>.yml" --resultsFilePath results-2.json --iterationCount 3
```
3. Run the test comparing all the results:
```shell
flashlight report baseline.json results-1.json results-2.json
```
