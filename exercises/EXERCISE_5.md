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

Identify why there is a visible lag when switching between languages and eliminate it.

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

### Part 1
1. Open React Devtools -> Profiler
2. Open settings and check "Highlight updates when components render"
3. Start profiling
4. Switch the language
5. Verify what is highlighted in the app after switching the language
6. Stop profiling
7. Analyze the profiler output - what do you see?

### Part 2
1. Disable "Highlight updates when components render"
2. Run command
```shell
flashlight measure
```
3. Once website is open, press "Auto-detect"
4. When the app is detected, press "Start measuring"
5. Change the language
6. Once everything recomputed, Stop measuring
7. **Do not stop the server or close Flashlight**

## The fix
Freeze the screen that you identified as a root cause of the lag.

<details>
  <summary>Solution</summary>
  In `App.tsx`, pass `freezeOnBlur: true` to `HomeScreen`
</details>


## Verification
1. Repeat the **Part 1** from the Baseline
2. Verify if highlighting is still heavily visible
3. Go to `android` folder and run `./gradlew assembleRelease` or use the `exercise-5.apk` file from `/artifacts`
4. Drag & Drop the new artifact
5. Repeat the **Part 2** from the Baseline, starting from point 4. Do not open flashlight from scratch - our goal is to compare the results
6. Compare the Flashlight results 