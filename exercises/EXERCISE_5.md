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
Reset the navigation state on language change so the screens in the stack are killed.

<details>
  <summary>Solution</summary>
  
  Reset the navigation using a method from `react-navigation`:
  ```diff
  diff --git a/screens/SettingsScreen.tsx b/screens/SettingsScreen.tsx
  index 5814266..fbb2316 100644
  --- a/screens/SettingsScreen.tsx
  +++ b/screens/SettingsScreen.tsx
  @@ -3,14 +3,27 @@ import {View, Text, Switch, StyleSheet, TouchableOpacity} from 'react-native';
  import {useAppSelector, useAppDispatch, useTranslation} from '../hooks';
  import {selectFabEnabled, toggleFab, setLanguage} from '../store';
  import {Language} from '../translations';
  +import {NativeStackScreenProps} from '@react-navigation/native-stack';
  +import {RootStackParamList} from './types';
  +import {CommonActions} from '@react-navigation/native';
  
  -const SettingsScreen = () => {
  +type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;
  +
  +const SettingsScreen = ({navigation}: Props) => {
    const dispatch = useAppDispatch();
    const fabEnabled = useAppSelector(selectFabEnabled);
    const {t, language} = useTranslation();
  
    const handleLanguageChange = (newLanguage: Language) => {
      dispatch(setLanguage(newLanguage));
  +
  +    // Reset navigation stack to Home screen
  +    navigation.dispatch(
  +      CommonActions.reset({
  +        index: 0,
  +        routes: [{name: 'Home'}],
  +      }),
  +    );
    };
  
    return (
  ```
  Into path import:
  ```
    import {differenceInDays} from 'date-fns/differenceInDays';
    import {format} from 'date-fns/format';
    import {parseISO} from 'date-fns/parseISO';
  ```
</details>


## Verification
1. Repeat the **Part 1** from the Baseline
2. Verify if highlighting is still heavily visible
3. Go to `android` folder and run `./gradlew assembleRelease`
4. Drag & Drop new artifact
5. Repeat the **Part 2** from the Baseline, starting from point 4
6. Compare the Flashlight results. What are your conclusions? 