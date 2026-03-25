import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from './store';
import {selectLanguage} from './store';
import {translations, TranslationKey} from './translations';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTranslation = () => {
  const language = useAppSelector(selectLanguage);

  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return {t, language};
};
