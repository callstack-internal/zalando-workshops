import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useAppSelector, useTranslation} from '../hooks';
import {selectBooksById, selectBookIds, selectAuthorsById, selectFavoriteBookIds} from '../store';
import BookListItem from '../components/BookListItem';
import performanceUtils from '../performance-utils';

type SortKey = 'score' | 'popular' | 'title' | 'author';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const booksById = useAppSelector(selectBooksById);
  const bookIds = useAppSelector(selectBookIds);
  const authorsById = useAppSelector(selectAuthorsById);
  const {t} = useTranslation();

  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);

  // Stop measuring navigation performance when HomeScreen mounts
  useEffect(() => {
    performanceUtils.stop('app-login');
  }, []);

  const sortOptions = useMemo(
    () => [
      {key: 'score' as const, label: t('sortScore')},
      {key: 'popular' as const, label: t('sortPopular')},
      {key: 'title' as const, label: t('sortTitle')},
      {key: 'author' as const, label: t('sortAuthor')},
    ],
    [t],
  );

  const favoritesProcessingData = useMemo(() => {
    const favoriteBooks = favoriteBookIds
      .map(id => booksById[id])
      .filter(Boolean);

    const favoriteAuthors = favoriteBooks.map(book => {
      const author = authorsById[book?.authorId];
      return author?.name
        .toLowerCase()
        .split('')
        .reverse()
        .join('')
        .toUpperCase();
    });

    const favoriteStats = {
      count: favoriteBookIds.length,
      authorsSet: new Set(favoriteBooks.map(b => b?.authorId)),
      processedAt: Date.now(),
    };

    return {favoriteBooks, favoriteAuthors, favoriteStats};
  }, [favoriteBookIds, booksById, authorsById]);

  const filteredBookIds = useMemo(() => {
    performanceUtils.start('search-filter');

    const trimmedSearch = search.trim().toLowerCase();
    const filteredIds = trimmedSearch
      ? bookIds.filter(id => {
          const book = booksById[id];
          const authorName = authorsById[book.authorId]?.name ?? '';
          return (
            book.title.toLowerCase().includes(trimmedSearch) ||
            authorName.toLowerCase().includes(trimmedSearch)
          );
        })
      : bookIds;

    const sortedIds = [...filteredIds].sort((aId, bId) => {
      const a = booksById[aId];
      const b = booksById[bId];

      switch (sortBy) {
        case 'popular':
          if (b.votes !== a.votes) {
            return b.votes - a.votes;
          }
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (authorsById[a.authorId]?.name ?? '').localeCompare(
            authorsById[b.authorId]?.name ?? '',
          );
        case 'score':
        default:
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.votes - a.votes;
      }
    });

    performanceUtils.stop('search-filter');
    return sortedIds;
  }, [search, bookIds, booksById, authorsById, sortBy]);

  const bookStats = useMemo(() => {
    const stats = {
      total: bookIds.length,
      filtered: filteredBookIds.length,
      searchActive: !!search.trim(),
      favorites: favoritesProcessingData.favoriteStats.count,
    };
    return stats;
  }, [bookIds, filteredBookIds, search, favoritesProcessingData]);

  return (
    <View
      style={styles.flex1}
      onLayout={() => {
        performanceUtils.start('app-home-render');
      }}>
      <TextInput
        value={search}
        onChangeText={text => {
          setSearch(text);
        }}
        placeholder={t('searchPlaceholder')}
        style={styles.input}
        testID="search-input"
      />
      <Text style={styles.centered}>
        {t('showing')} {bookStats.filtered} {t('of')} {bookStats.total}{' '}
        {t('books')} | ❤️ {bookStats.favorites} {t('favorites')}
      </Text>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>{t('sortBy')}</Text>
        <View style={styles.sortOptions}>
          {sortOptions.map(option => {
            const isActive = option.key === sortBy;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  isActive && styles.sortOptionActive,
                ]}
                onPress={() => setSortBy(option.key)}>
                <Text
                  style={[
                    styles.sortOptionText,
                    isActive && styles.sortOptionTextActive,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <FlatList
        data={filteredBookIds}
        renderItem={({item}) => (
          <BookListItem id={item}/>
        )}
        keyExtractor={item => item}
        contentContainerStyle={{paddingVertical: 8}}
        initialNumToRender={500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {flex: 1},
  input: {
    borderWidth: 1,
    borderColor: '#b0b4c1',
    margin: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    fontSize: 17,
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  devPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    minHeight: 180,
    elevation: 12,
    position: 'relative',
  },
  devPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  devPanelClose: {
    position: 'absolute',
    right: 18,
    top: 18,
    padding: 8,
    zIndex: 10,
  },
  devPanelAction: {
    paddingVertical: 12,
  },

  centered: {textAlign: 'center', margin: 8},
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: '#444',
    marginRight: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d4d7e2',
    marginTop: 6,
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  sortOptionText: {
    fontSize: 13,
    color: '#444',
  },
  sortOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
