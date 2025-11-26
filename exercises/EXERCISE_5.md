# Exercise 5: Over-subscribing

## Exercise overview
- Estimated time: 30mins
- Tools required: React DevTools, Flashlight

## Learning objectives
- Learn how screens stacks work
- Learn how to identify when background screens are responding to global state changes

## Prerequisites

- Android app running

## Background

QA reported that when attempting to switch the language in the app on a low-end Android device, they experience a significant app freeze (UI blocking) for a moment where the app becomes unresponsive.

Crucially, this issue is not reproducible immediately after launching the app (e.g., on the Login screen). It only manifests after the user has been using the app for some time

## Objective

Prepare a strategy how to approach the problem.

## Reproduction steps

1. Open the app
2. Login into the app
3. Add a book to favorites
4. Go to Favorites
5. Switch the tab to "Authors"
6. Press on one of the books in the screen to navigate to details
7. Once in the details, open Settings
8. Switch the language

## Baseline

## Part 1
1. Open React Devtools -> Profiler
2. Open settings and check "Highlight updates when components render"
3. Start profiling
4. Switch the language
5. Verify what is highlighted in the app after switching the language
6. Stop profiling
7. Analyze the profiler output - what do you see?

## Part 2
1. Disable "Highlight updates when components render"
2. Run command
```shell
flashlight measure
```
3. Once website is open, press "Auto-detect"
4. When the app is detected, press "Start measuring"
5. Change the language
6. Once everything recomputed, Stop measuring
7. Repeat the same scenario two more times to have 3 measurements
8. Download the report results


## Verification
1. Apply the diff to the codebase:
```diff
diff --git a/performance-utils.ts b/performance-utils.ts
index 6eee966..15f82b9 100644
--- a/performance-utils.ts
+++ b/performance-utils.ts
@@ -1,4 +1,5 @@
 // Performance measurement utilities with start/stop API
+import { Alert } from 'react-native';
 import performance, {PerformanceObserver} from 'react-native-performance';
 
 // Observe native launch marks to derive higher-level measures
@@ -64,7 +65,10 @@ const performanceUtils = {
 
       try {
         // Measure between start and end marks
-        performance.measure(measureName, startMarkName, endMarkName);
+        const measure = performance.measure(measureName, startMarkName, endMarkName);
+        if(measureName === 'app-login') {
+          Alert.alert(measure.duration.toString());
+        }
 
         // Get the measurement and log it
         const entries = performance.getEntriesByName(measureName);
```
2. Build the app in release mode:
```shell
cd android
./gradlew assembleRelease
```
3. Drag and drop the generated `.apk` in the emulator (you can also use `artifacts/exercise-4.apk`)
4. Open the app and go to Settings screen
5. Enable "Show Debug FAB" and go back to login screen
6. Open debug FAB, start the profiling
7. Once you are navigated, validate the `app-login` time in the Alert
8. Open debug FAB again and stop profiling
9. In terminal, run
```shell
npm run bundle:android
```
10. In terminal, run
```shell
npm run downloadtrace:android
```
11. The profile will be saved in the root of your project
12. Upload it into SpeedScope and compare the output with the one from debug