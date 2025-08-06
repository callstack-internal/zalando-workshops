# Exercise 2: Profiling React Native with Chrome DevTools

## Overview
In this exercise, we'll learn how to use Chrome DevTools to profile JavaScript performance in React Native applications. We'll set up port forwarding and use Chrome's profiler to identify performance bottlenecks.

## Prerequisites
- Chromium-based browser installed
- Metro bundler running
- Physical device or emulator with the app running

## Part 1: Setting Up Chrome DevTools

### Step 1: Enable JS profiling in React Native DevTools
1. **Start the Metro server**
   ```bash
   npm run start
   ```

2. Open your browser's developer tools (`j` in Metro)
3. Press the "Settings" icon in the top right corner
4. Go to "Experiments"
5. Check "[React Native] Enable Performance panel
6. Re-run the React Native DevTools

## Part 2: Performance Profiling

### Step 2: Navigate to Performance Tab
1. In the opened DevTools window, click on the "Performance" tab
2. You'll see options to record performance profiles

## Part 3: Record the trace

### Step 3: Record a profile trace
1. Open the app (cold start)
2. Start recording in Chrome DevTools
3. Press "Login"
4. Stop recording once it navigated to the `HomeScreen`
5. Download the profile trace

### Step 4: Analyze the profile trace
1. Open https://www.speedscope.app/
2. Upload recorded profile trace
3. Analyze it to see where does it spend the most of time
4. Note the key findings and results

### What to Look For:
- **Long Tasks**: long JavaScript execution blocks
- **Frequent Re-renders**: Multiple renders of the same components

## Part 4: Optimize the code and re-profile

### Step 5: Implement Optimizations
1. **Checkout branch `perf/exercise-2`**

### Step 6: Re-profile
1. Repeat the profiling process

### Step 7: Compare the results with the baseline
1. Compare the new profile with the original
2. Look for improvements in:
   - Reduced JavaScript execution time
   - Fewer long tasks

## Troubleshooting

### Common Issues:
- **DevTools not connecting**: Check that Metro is running
- **Profile data missing**: Ensure you're interacting with the app during recording

## Resources
- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Metro Bundler Configuration](https://facebook.github.io/metro/docs/configuration)
