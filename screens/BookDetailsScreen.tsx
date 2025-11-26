import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {useAppSelector, useAppDispatch, useTranslation} from '../hooks';
import {
  selectBookById,
  selectAuthorById,
  selectLast10CommentsByBookId,
  selectIsBookFavorite,
  toggleFavorite,
  addComment,
} from '../store';
import {formatDate} from '../utils';
import performanceUtils from '../performance-utils';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetails'>;

export default function BookDetailsScreen({route}: Props) {
  const {bookId} = route.params;
  const dispatch = useAppDispatch();
  const {t} = useTranslation();

  // Redux selectors
  const book = useAppSelector(state => selectBookById(state, bookId));
  const author = useAppSelector(state =>
    selectAuthorById(state, book?.authorId ?? ''),
  );
  const comments = useAppSelector(state =>
    selectLast10CommentsByBookId(state, bookId),
  );
  const isFavorite = useAppSelector(state =>
    selectIsBookFavorite(state, bookId),
  );

  // Local state for adding comments
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');

  // Performance tracking
  useEffect(() => {
    performanceUtils.start('book-details-render');
    return () => {
      performanceUtils.stop('book-details-render');
    };
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    performanceUtils.start(`toggle-favorite-details-${bookId}`);
    dispatch(toggleFavorite(bookId));
    performanceUtils.stop(`toggle-favorite-details-${bookId}`);
  };

  // Handle add comment
  const handleAddComment = () => {
    if (!newCommentAuthor.trim() || !newCommentContent.trim()) {
      Alert.alert(t('error'), t('pleaseEnterBothAuthorAndComment'));
      return;
    }

    performanceUtils.start('add-comment');

    const newComment = {
      id: `comment-${Date.now()}`,
      bookId,
      author: newCommentAuthor.trim(),
      content: newCommentContent.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch(addComment(newComment));

    // Clear form
    setNewCommentAuthor('');
    setNewCommentContent('');

    performanceUtils.stop('add-comment');

    Alert.alert(t('success'), t('commentAdded'));
  };

  // If book not found
  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('bookNotFound')}</Text>
      </View>
    );
  }

  // Calculate current year for author age
  const currentYear = new Date().getFullYear();
  const authorAge = author ? currentYear - author.birthYear : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section with Favorite Button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('basicInformation')}</Text>
        <InfoRow label={t('author')} value={author?.name || t('unknown')} />
        <InfoRow label={t('genre')} value={book.genre} />
        <InfoRow label={t('published')} value={formatDate(book.publishedDate)} />
        <InfoRow
          label={t('lastRead')}
          value={book.lastRead ? formatDate(book.lastRead) : t('never')}
        />
      </View>

      {/* Rating & Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('ratingsAndStatistics')}</Text>
        <InfoRow
          label={t('rating')}
          value={
            book.votes > 0
              ? `${book.rating.toFixed(2)} / 5.0`
              : t('notRatedYet')
          }
        />
        <InfoRow label={t('votes')} value={book.votes.toLocaleString()} />
      </View>

      {/* Author Details Section */}
      {author && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('authorDetails')}</Text>
          <InfoRow label={t('nationality')} value={author.nationality} />
          <InfoRow
            label={t('birthYear')}
            value={author.birthYear.toString()}
          />
          <InfoRow label={t('age')} value={`${authorAge} ${t('years')}`} />
          <InfoRow label={t('awards')} value={author.awards.toString()} />
          <InfoRow label={t('primaryGenre')} value={author.primaryGenre} />
          <InfoRow
            label={t('yearsActive')}
            value={author.yearsActive.toString()}
          />
        </View>
      )}

      {/* Comments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('recentComments')} ({comments.length})
        </Text>

        {comments.length === 0 ? (
          <Text style={styles.noComments}>{t('noCommentsYet')}</Text>
        ) : (
          comments.map((comment, index) => (
            <View key={`${comment.id}-${index}`} style={styles.commentCard}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))
        )}
      </View>

      {/* Add Comment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('addComment')}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('yourName')}
          value={newCommentAuthor}
          onChangeText={setNewCommentAuthor}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('yourComment')}
          value={newCommentContent}
          onChangeText={setNewCommentContent}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
          <Text style={styles.submitButtonText}>{t('submitComment')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Helper component for info rows
const InfoRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  commentCard: {
    backgroundColor: '#f6f6f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
