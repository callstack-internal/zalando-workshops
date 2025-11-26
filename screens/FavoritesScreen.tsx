import React, {useMemo, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import TabView, {SceneMap} from 'react-native-bottom-tabs';
import {useAppSelector, useTranslation} from '../hooks';
import {selectBooks, selectAuthors, selectFavoriteBookIds} from '../store';
import BookListItem from '../components/BookListItem';

const BooksRoute = () => {
  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
  const {t} = useTranslation();

  if (favoriteBookIds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📚</Text>
        <Text style={styles.emptyTitle}>{t('noFavoriteBooksYet')}</Text>
        <Text style={styles.emptySubtitle}>{t('tapHeartToAdd')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoriteBookIds}
      renderItem={({item}) => (
        <BookListItem id={item} />
      )}
      keyExtractor={item => item}
      contentContainerStyle={{paddingVertical: 8}}
    />
  );
};

const AuthorsRoute = () => {
  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
  const books = useAppSelector(selectBooks);
  const authors = useAppSelector(selectAuthors);
  const {t} = useTranslation();

  const getCountryFlag = (country: string) => {
    const countryFlags: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      Canada: '🇨🇦',
      Australia: '🇦🇺',
      Germany: '🇩🇪',
      France: '🇫🇷',
      Italy: '🇮🇹',
      Spain: '🇪🇸',
      Japan: '🇯🇵',
      China: '🇨🇳',
      India: '🇮🇳',
      Brazil: '🇧🇷',
      Russia: '🇷🇺',
      Mexico: '🇲🇽',
      Argentina: '🇦🇷',
      Chile: '🇨🇱',
      Colombia: '🇨🇴',
      Peru: '🇵🇪',
      Venezuela: '🇻🇪',
      Ecuador: '🇪🇨',
      Uruguay: '🇺🇾',
      Paraguay: '🇵🇾',
      Bolivia: '🇧🇴',
      Netherlands: '🇳🇱',
      Belgium: '🇧🇪',
      Switzerland: '🇨🇭',
      Austria: '🇦🇹',
      Poland: '🇵🇱',
      'Czech Republic': '🇨🇿',
      Slovakia: '🇸🇰',
      Hungary: '🇭🇺',
      Romania: '🇷🇴',
      Bulgaria: '🇧🇬',
      Croatia: '🇭🇷',
      Serbia: '🇷🇸',
      Slovenia: '🇸🇮',
      'Bosnia and Herzegovina': '🇧🇦',
      Montenegro: '🇲🇪',
      'North Macedonia': '🇲🇰',
      Albania: '🇦🇱',
      Greece: '🇬🇷',
      Turkey: '🇹🇷',
      Cyprus: '🇨🇾',
      Malta: '🇲🇹',
      Portugal: '🇵🇹',
      Ireland: '🇮🇪',
      Iceland: '🇮🇸',
      Norway: '🇳🇴',
      Sweden: '🇸🇪',
      Finland: '🇫🇮',
      Denmark: '🇩🇰',
      Estonia: '🇪🇪',
      Latvia: '🇱🇻',
      Lithuania: '🇱🇹',
      Ukraine: '🇺🇦',
      Belarus: '🇧🇾',
      Moldova: '🇲🇩',
      Georgia: '🇬🇪',
      Armenia: '🇦🇲',
      Azerbaijan: '🇦🇿',
      Kazakhstan: '🇰🇿',
      Uzbekistan: '🇺🇿',
      Turkmenistan: '🇹🇲',
      Kyrgyzstan: '🇰🇬',
      Tajikistan: '🇹🇯',
      Afghanistan: '🇦🇫',
      Pakistan: '🇵🇰',
      Bangladesh: '🇧🇩',
      'Sri Lanka': '🇱🇰',
      Nepal: '🇳🇵',
      Bhutan: '🇧🇹',
      Myanmar: '🇲🇲',
      Thailand: '🇹🇭',
      Vietnam: '🇻🇳',
      Laos: '🇱🇦',
      Cambodia: '🇰🇭',
      Malaysia: '🇲🇾',
      Singapore: '🇸🇬',
      Indonesia: '🇮🇩',
      Philippines: '🇵🇭',
      Brunei: '🇧🇳',
      'South Korea': '🇰🇷',
      'North Korea': '🇰🇵',
      Mongolia: '🇲🇳',
      Taiwan: '🇹🇼',
      'Hong Kong': '🇭🇰',
      Macau: '🇲🇴',
      Israel: '🇮🇱',
      Palestine: '🇵🇸',
      Jordan: '🇯🇴',
      Lebanon: '🇱🇧',
      Syria: '🇸🇾',
      Iraq: '🇮🇶',
      Iran: '🇮🇷',
      Kuwait: '🇰🇼',
      'Saudi Arabia': '🇸🇦',
      Bahrain: '🇧🇭',
      Qatar: '🇶🇦',
      'United Arab Emirates': '🇦🇪',
      Oman: '🇴🇲',
      Yemen: '🇾🇪',
      Egypt: '🇪🇬',
      Libya: '🇱🇾',
      Tunisia: '🇹🇳',
      Algeria: '🇩🇿',
      Morocco: '🇲🇦',
      Sudan: '🇸🇩',
      'South Sudan': '🇸🇸',
      Ethiopia: '🇪🇹',
      Eritrea: '🇪🇷',
      Djibouti: '🇩🇯',
      Somalia: '🇸🇴',
      Kenya: '🇰🇪',
      Uganda: '🇺🇬',
      Tanzania: '🇹🇿',
      Rwanda: '🇷🇼',
      Burundi: '🇧🇮',
      'Democratic Republic of the Congo': '🇨🇩',
      'Republic of the Congo': '🇨🇬',
      'Central African Republic': '🇨🇫',
      Cameroon: '🇨🇲',
      Chad: '🇹🇩',
      Niger: '🇳🇪',
      Nigeria: '🇳🇬',
      Benin: '🇧🇯',
      Togo: '🇹🇬',
      Ghana: '🇬🇭',
      'Burkina Faso': '🇧🇫',
      Mali: '🇲🇱',
      Senegal: '🇸🇳',
      Mauritania: '🇲🇷',
      Gambia: '🇬🇲',
      'Guinea-Bissau': '🇬🇼',
      Guinea: '🇬🇳',
      'Sierra Leone': '🇸🇱',
      Liberia: '🇱🇷',
      'Ivory Coast': '🇨🇮',
      'South Africa': '🇿🇦',
      Namibia: '🇳🇦',
      Botswana: '🇧🇼',
      Zimbabwe: '🇿🇼',
      Zambia: '🇿🇲',
      Malawi: '🇲🇼',
      Mozambique: '🇲🇿',
      Madagascar: '🇲🇬',
      Mauritius: '🇲🇺',
      Seychelles: '🇸🇨',
      Comoros: '🇰🇲',
      'Cape Verde': '🇨🇻',
      'São Tomé and Príncipe': '🇸🇹',
      'Equatorial Guinea': '🇬🇶',
      Gabon: '🇬🇦',
      Angola: '🇦🇴',
      Lesotho: '🇱🇸',
      Eswatini: '🇸🇿',
      'New Zealand': '🇳🇿',
      'Papua New Guinea': '🇵🇬',
      Fiji: '🇫🇯',
      'Solomon Islands': '🇸🇧',
      Vanuatu: '🇻🇺',
      Samoa: '🇼🇸',
      Tonga: '🇹🇴',
      Tuvalu: '🇹🇻',
      Kiribati: '🇰🇮',
      Nauru: '🇳🇷',
      Palau: '🇵🇼',
      'Marshall Islands': '🇲🇭',
      Micronesia: '🇫🇲',
    };

    return countryFlags[country] || '🌍';
  };

  // Get all authors with their favorite books, sorted by favorite count
  const authorsWithBooks = useMemo(() => {
    return authors
      .map(author => {
        const authorBooks = books.filter(
          book =>
            book.authorId === author.id && favoriteBookIds.includes(book.id),
        );
        const totalBooks = books.filter(book => book.authorId === author.id);

        return {
          authorId: author.id,
          authorName: author.name,
          books: authorBooks,
          totalBooksCount: totalBooks.length,
        };
      })
      .filter(author => author.totalBooksCount > 0) // Filter out authors with 0 books
      .sort((a, b) => b.books.length - a.books.length); // Sort by favorite count descending
  }, [favoriteBookIds, books, authors]);

  if (authorsWithBooks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>👨‍💼</Text>
        <Text style={styles.emptyTitle}>{t('noAuthorsFound')}</Text>
        <Text style={styles.emptySubtitle}>{t('somethingWentWrong')}</Text>
      </View>
    );
  }

  const renderAuthorWithBooks = ({
    item,
  }: {
    item: (typeof authorsWithBooks)[0];
  }) => {
    const currentYear = new Date().getFullYear();
    const author = authors.find(a => a.id === item.authorId);
    const authorAge = author ? currentYear - author.birthYear : 0;

    const totalAwards = author?.awards || 0;
    const hasInternationalName =
      author?.nationality && author.nationality !== 'United States';
    const genreMatch = item.books.filter(
      book => book.genre === author?.primaryGenre,
    ).length;

    const sortedBooks = [...item.books].sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() -
        new Date(a.publishedDate).getTime(),
    );
    const newestBook = sortedBooks[0];
    const oldestBook = sortedBooks[sortedBooks.length - 1];

    return (
      <View>
        <View style={styles.authorCard}>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.authorName}</Text>
            <View style={styles.countsContainer}>
              <Text style={styles.bookCount}>{item.books.length}</Text>
              <Text style={styles.totalCount}>/ {item.totalBooksCount}</Text>
            </View>
          </View>
          <Text style={styles.authorStats}>
            {t('age')}: {authorAge} | {t('awards')}: {totalAwards} |{' '}
            {t('genreMatches')}: {genreMatch}
          </Text>
          {hasInternationalName && (
            <Text style={styles.nationality}>
              {getCountryFlag(author?.nationality || '')} {author?.nationality}
            </Text>
          )}
          {newestBook && (
            <Text style={styles.bookRange}>
              {t('newest')}: {new Date(newestBook.publishedDate).getFullYear()}{' '}
              - {t('oldest')}:{' '}
              {new Date(oldestBook.publishedDate).getFullYear()}
            </Text>
          )}
        </View>
        <View style={styles.booksList}>
          {item.books.map(book => (
            <BookListItem
              key={book.id}
              id={book.id}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      testID="authors-list"
      data={authorsWithBooks}
      renderItem={renderAuthorWithBooks}
      keyExtractor={item => item.authorId}
      contentContainerStyle={{paddingVertical: 8}}
      removeClippedSubviews={false}
      initialNumToRender={50}
      maxToRenderPerBatch={30}
      windowSize={20}
      updateCellsBatchingPeriod={50}
    />
  );
};

const renderScene = SceneMap({
  books: BooksRoute,
  authors: AuthorsRoute,
});

const FavoritesScreen = () => {
  const favoriteBookIds = useAppSelector(selectFavoriteBookIds);
  const {t} = useTranslation();

  const [index, setIndex] = useState(0);

  // Update route titles when counts change
  const updatedRoutes = useMemo(
    () => [
      {
        key: 'books',
        title: `${t('booksTab')} (${favoriteBookIds.length})`,
      },
      {
        key: 'authors',
        title: t('authorsTab'),
        testID: 'authors-tab',
      },
    ],
    [favoriteBookIds.length, t],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {t('yourFavorites')} ({favoriteBookIds.length})
      </Text>

      <TabView
        navigationState={{index, routes: updatedRoutes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        labeled={true}
        tabBarActiveTintColor="#007AFF"
        tabBarInactiveTintColor="#666"
        getIcon={({route, focused}) => {
          if (route.key === 'books') {
            return {
              sfSymbol: focused ? 'book.fill' : 'book',
            };
          } else if (route.key === 'authors') {
            return {
              sfSymbol: focused ? 'person.fill' : 'person',
            };
          }
          return undefined;
        }}
      />
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
  },
  authorCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  authorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  countsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  totalCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  booksList: {
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  authorStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookRange: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nationality: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
