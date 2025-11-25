import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useAppSelector} from '../hooks';
import {selectBooks, selectAuthors} from '../store';
import BookListItem from '../components/BookListItem';
import performanceUtils from '../performance-utils';

const sortOptions = [
  {key: 'score', label: 'Score'},
  {key: 'popular', label: 'Most popular'},
  {key: 'title', label: 'Title'},
  {key: 'author', label: 'Author'},
] as const;

type SortKey = (typeof sortOptions)[number]['key'];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const books = useAppSelector(selectBooks);
  const authors = useAppSelector(selectAuthors);

  const favoriteBookIds = useAppSelector(
    state => state.favorites.favoriteBookIds,
  );

  // Stop measuring navigation performance when HomeScreen mounts
  useEffect(() => {
    performanceUtils.stop('app-login');
  }, []);

  const authorsById = useMemo(() => {
    const map: Record<string, string> = {};
    authors.forEach(author => {
      map[author.id] = author.name;
    });
    return map;
  }, [authors]);

  const favoritesProcessingData = useMemo(() => {
    const favoriteBooks = favoriteBookIds
      .map(id => books.find(book => book.id === id))
      .filter(Boolean);

    const favoriteAuthors = favoriteBooks.map(book => {
      const author = authors.find(a => a.id === book?.authorId);
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
  }, [favoriteBookIds, books, authors]);

  const filteredBookIds = useMemo(() => {
    performanceUtils.start('search-filter');

    const trimmedSearch = search.trim().toLowerCase();
    const filteredBooks = trimmedSearch
      ? books.filter(book => {
          const authorName = authorsById[book.authorId] ?? '';
          return (
            book.title.toLowerCase().includes(trimmedSearch) ||
            authorName.toLowerCase().includes(trimmedSearch)
          );
        })
      : books;

    const sortedBooks = [...filteredBooks].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          if (b.votes !== a.votes) {
            return b.votes - a.votes;
          }
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (authorsById[a.authorId] ?? '').localeCompare(
            authorsById[b.authorId] ?? '',
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
    return sortedBooks.map(book => book.id);
  }, [search, books, authorsById, sortBy]);

  const bookStats = useMemo(() => {
    const stats = {
      total: books.length,
      filtered: filteredBookIds.length,
      searchActive: !!search.trim(),
      favorites: favoritesProcessingData.favoriteStats.count,
    };
    return stats;
  }, [books, filteredBookIds, search, favoritesProcessingData]);

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
        placeholder="Search by book or author"
        style={styles.input}
        testID="search-input"
      />
      <Text style={styles.centered}>
        Showing {bookStats.filtered} of {bookStats.total} books | ❤️{' '}
        {bookStats.favorites} favorites
      </Text>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
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
          <BookListItem id={item} favoriteBookIds={favoriteBookIds} />
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
