import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import performanceUtils from '../performance-utils';
import {useTranslation} from '../hooks';

const StartScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <View style={styles.centered}>
      <Text style={styles.emoji}>🚀</Text>
      <Text style={styles.title}>{t('performanceWorkshop')}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          performanceUtils.start('app-login');
          navigation.navigate('Home');
        }}>
        <Text style={styles.buttonText}>{t('login')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  emoji: {fontSize: 64, marginBottom: 16},
  title: {fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8},
  subtitle: {fontSize: 16, color: '#666', marginBottom: 32},
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});

export default StartScreen;
