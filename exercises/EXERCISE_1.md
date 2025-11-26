# Exercise 1: Analyze and reduce bundle size of the app

## Exercise overview
- Estimated time: 30 mins
- Tools required: React Native DevTools, Bundle Discovery

## Learning objectives
- Learn how to use tool to analyze the bundle size
- Learn how to reduce the bundle size
- Understand how it impacts the app load time

## Prerequisites

- Android app in dev mode

## Background

Monitoring flagged a spike in `runJsBundle` over the past week on Android platform. Looking at last week’s release notes, the increase lines up with the build that swapped `moment.js` for `date-fns`. 

## Objective

Speed up the JS bundle load time without reverting the entire migration to `moment.js`

## Reproduction steps

1. Open the app (cold start) on **Android**
2. Verify the `runJsBundle` metric is available

## Baseline (measure before)

1. Open the app (cold start)
2. Open React DevTools from Metro
3. **Baseline:** Note down the `runJsBundle` result
4. Run the Android bundle command: `npm run bundle:android`
5. Run the bundle discovery command: `npm run bundle:discover`
6. **Baseline:** Note down the bundle size
7. **Baseline:** Note down the size of `date-fns` in the bundle

## The fix
1. Look for `date-fns` imports in the app
2. Rewrite the `date-fns` named imports into path imports

<details>
  <summary>Solution</summary>
  
  Change named import:
  ```
    import {differenceInDays, format, parseISO} from 'date-fns';
  ```
  Into path import:
  ```
    import {differenceInDays} from 'date-fns/differenceInDays';
    import {format} from 'date-fns/format';
    import {parseISO} from 'date-fns/parseISO';
  ```
</details>

## Verification

- Re-run the same measurement tests
- Record new metrics and compare with the baseline:
    - `runJsBundle`
    - bundle size: x mb (x % improvement/regression)
    - `date-fns` size: x kb (x % improvement/regression)