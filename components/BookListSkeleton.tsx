import React from 'react';
import {View, StyleSheet} from 'react-native';

const SkeletonItem = () => (
  <View style={styles.card}>
    <View style={styles.info}>
      <View style={[styles.skeleton, styles.titleSkeleton]} />
      <View style={[styles.skeleton, styles.authorSkeleton]} />
      <View style={[styles.skeleton, styles.dateSkeleton]} />
      <View style={[styles.skeleton, styles.dateSkeleton]} />
      <View style={[styles.skeleton, styles.ratingSkeleton]} />
      <View style={[styles.skeleton, styles.commentSkeleton]} />
    </View>
    <View style={styles.favoriteButtonSkeleton} />
  </View>
);

const BookListSkeleton = () => {
  return (
    <View style={styles.container}>
      {Array.from({length: 8}).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
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
  skeleton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  titleSkeleton: {
    height: 16,
    width: '70%',
    marginBottom: 4,
  },
  authorSkeleton: {
    height: 14,
    width: '50%',
    marginBottom: 6,
  },
  dateSkeleton: {
    height: 12,
    width: '60%',
    marginBottom: 4,
  },
  ratingSkeleton: {
    height: 12,
    width: '65%',
    marginBottom: 8,
  },
  commentSkeleton: {
    height: 26,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  favoriteButtonSkeleton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
  },
});

export default BookListSkeleton;

