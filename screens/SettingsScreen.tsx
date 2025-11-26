import React from 'react';
import {View, Text, Switch, StyleSheet, TouchableOpacity} from 'react-native';
import {useAppSelector, useAppDispatch, useTranslation} from '../hooks';
import {selectFabEnabled, toggleFab, setLanguage} from '../store';
import {Language} from '../translations';

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const fabEnabled = useAppSelector(selectFabEnabled);
  const {t, language} = useTranslation();

  const handleLanguageChange = (newLanguage: Language) => {
    dispatch(setLanguage(newLanguage));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings')}</Text>

      <View style={styles.setting}>
        <Text style={styles.settingLabel}>{t('showDebugFAB')}</Text>
        <Switch
          value={fabEnabled}
          onValueChange={_value => {
            dispatch(toggleFab());
          }}
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={fabEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.settingLabel}>{t('language')}</Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'en' && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageChange('en')}>
            <Text
              style={[
                styles.languageButtonText,
                language === 'en' && styles.languageButtonTextActive,
              ]}>
              {t('english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'de' && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageChange('de')}>
            <Text
              style={[
                styles.languageButtonText,
                language === 'de' && styles.languageButtonTextActive,
              ]}>
              {t('german')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingGroup: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d7e2',
    backgroundColor: '#fff',
  },
  languageButtonActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#444',
  },
  languageButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SettingsScreen;
