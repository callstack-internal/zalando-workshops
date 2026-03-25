# Exercise 4: Validate the production builds

## Exercise overview
- Estimated time: 15mins
- Tools required: React Native Release Profiler, SpeedScope

## Learning objectives
- Learn how to profile the app in the production
- Learn what is symbolication
- Learn the differences between debug and release builds

## Prerequisites

- Android app running

## Background

A developer reported that while working on a feature, he noticed logging into the app is slow on the Android emulator. He shared that `app-login` metric is around 2 seconds.

## Objective

Verify if the report from the developer is valid.

## Reproduction steps

1. Open the app (cold start)
2. Go to Performance tab in React Devtools
3. Start recording
4. Login into the app
5. Stop profiling
6. Download the profile

## Baseline

1. Open https://www.speedscope.app/
2. Upload recorded profile trace
3. Analyze the output
4. **Baseline**: Note down the time spent JS thread being blocked by the action
5. **Baseline**: Note down the `app-login` result from the console


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