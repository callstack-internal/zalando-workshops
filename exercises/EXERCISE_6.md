# Exercise 6: Hermes gotchas

## Exercise overview
- Estimated time: 1h
- Tools required: JavaScript profiler, Flashlight

## Learning objectives
- 
- 

## Prerequisites

- Android app running

## Background

Monitoring tool indicates that `sort-title` and `sort-author` metrics are way slower than `sort-popular` and `sort-score`. The result of sorting for those functions seems to be even 100 times slower during the single session.

## Objective

1. Optimize the sorting mechanism so all the sorts are similarly efficient.
2. Make the switch between sorts smooth

## Reproduction steps

1. Open the app
2. Login into the app
3. Press "Most Popular"
4. Press "Title"

## Baseline

### Part 1
1. Open React Devtools -> Console
2. Login into the app
3. Press "Most Popular"
4. **Baseline**: Note down the `sort-popular` metric
5. Press "Title"
6. **Baseline**: Note down the `sort-title` metric
7. Press "Author"
8. **Baseline**: Note down the `sort-author` metric

### Part 2
1. In `flows/` create the Maestro flow that runs the app, logs into the app, clicks "Title" and asserts visibility of "1984"

<details>
  <summary>Solution</summary>
  

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

2. Run the automated flashlight measurements and save the results to the file:
```shell
flashlight test --bundleId com.performanceworkshops --testCommand "maestro test flows/<flow-name>.yml" --resultsFilePath baseline.json --iterationCount 3
```


## The fix - Part 1
1. Create custom function that uses a single instance of Intl.Collator

<details>
  <summary>Solution</summary>
  
  Create a single Intl.Collator instance
  ```diff

  ```
</details>


## Verification