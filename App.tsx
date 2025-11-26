import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import StartScreen from './screens/StartScreen';
import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';
import BookDetailsScreen from './screens/BookDetailsScreen';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Provider} from 'react-redux';
import {useAppSelector, useAppDispatch, useTranslation} from './hooks';
import {
  store,
  selectFabEnabled,
  setFabEnabled,
  setFavoriteBookIds,
  setLanguage,
} from './store';
import DevPanel from './components/DevPanel';
import HeaderMenu from './components/HeaderMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

function AppContent() {
  const [devPanelVisible, setDevPanelVisible] = useState(false);
  const fabEnabled = useAppSelector(selectFabEnabled);
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load FAB setting
        const savedFabSetting = await AsyncStorage.getItem('fabEnabled');
        if (savedFabSetting !== null) {
          dispatch(setFabEnabled(JSON.parse(savedFabSetting)));
        }

        // Load favorite books
        const savedFavorites = await AsyncStorage.getItem('favoriteBookIds');
        if (savedFavorites !== null) {
          dispatch(setFavoriteBookIds(JSON.parse(savedFavorites)));
        }

        // Load language setting
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage !== null) {
          dispatch(setLanguage(savedLanguage));
        }
      } catch (error) {
        console.log('Error loading settings:', error);
      }
    };
    loadSettings();
  }, [dispatch]);

  return (
    <View style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen
            name="Start"
            component={StartScreen}
            options={{
              title: t('performanceWorkshop'),
              headerRight: () => <HeaderMenu />,
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: t('booksHeader'),
              headerRight: () => <HeaderMenu />,
            }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              title: t('favoriteBooksAndAuthors'),
              headerRight: () => <HeaderMenu />,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{title: t('settings')}}
          />
          <Stack.Screen
            name="BookDetails"
            component={BookDetailsScreen}
            options={{
              title: t('bookDetails'),
              headerRight: () => <HeaderMenu />,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {/* Floating Debug Button - only show if enabled */}
      {fabEnabled && (
        <TouchableOpacity
          style={appStyles.fab}
          onPress={() => setDevPanelVisible(true)}
          activeOpacity={0.7}>
          <Text style={appStyles.fabIcon}>🐞</Text>
        </TouchableOpacity>
      )}
      {/* Dev Panel */}
      <DevPanel
        visible={devPanelVisible}
        onClose={() => setDevPanelVisible(false)}
      />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const appStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#222',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
  },
});
