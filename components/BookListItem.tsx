import React, {useEffect, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useAppSelector, useAppDispatch} from '../hooks';
import {
  selectBookById,
  selectAuthorById,
  selectCommentsByBookId,
  toggleFavorite,
} from '../store';
import {formatDate} from '../utils';
import performanceUtils from '../performance-utils';

interface BookListItemProps {
  id: string;
  favoriteBookIds: string[];
}

const BookListItem = ({id, favoriteBookIds}: BookListItemProps) => {
  const dispatch = useAppDispatch();
  const book = useAppSelector(state => selectBookById(state, id));
  const authorName = useAppSelector(
    state => selectAuthorById(state, book?.authorId ?? '')?.name,
  );
  const comments = useAppSelector(state => selectCommentsByBookId(state, id));
  const lastComment = comments[comments.length - 1];

  const isFavorite = useMemo(() => {
    const isBookFavorite = favoriteBookIds.includes(id);

    return isBookFavorite;
  }, [favoriteBookIds, id]);

  useEffect(() => {
    if(isFavorite) {
      performanceUtils.stop(`toggle-favorite-${id}`);
    }
  }, [isFavorite])

  const handleToggleFavorite = () => {
    performanceUtils.start(`toggle-favorite-${id}`);
    dispatch(toggleFavorite(id));
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{book?.title}</Text>
        <Text style={styles.author}>{authorName}</Text>
        <Text style={styles.date}>
          Published:{' '}
          {book?.publishedDate ? formatDate(book.publishedDate) : 'Unknown'}
        </Text>
        <Text style={styles.lastRead}>
          Last read: {book?.lastRead ? formatDate(book.lastRead) : 'Never'}
        </Text>
        <Text style={styles.rating}>
          {book
            ? book.votes > 0
              ? `Rating: ${book.rating.toFixed(2)} (${book.votes.toLocaleString()} votes)`
              : 'Not rated yet'
            : 'Loading...'}
        </Text>
        <Text style={styles.comment}>
          {lastComment?.author}: {lastComment?.content?.slice(0, 30)}
          {lastComment?.content?.length > 30 ? '…' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={handleToggleFavorite}>
        <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  author: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  lastRead: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
  },
  comment: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
    backgroundColor: '#f6f6f6',
    padding: 6,
    borderRadius: 6,
  },
  favoriteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
});

export default BookListItem;
