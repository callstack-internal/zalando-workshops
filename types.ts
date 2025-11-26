export interface Book {
  id: string;
  title: string;
  authorId: string;
  genre: string;
  publishedDate: string;
  lastRead: string;
  rating: number;
  votes: number;
}

export interface Author {
  id: string;
  name: string;
  birthYear: number;
  nationality: string;
  primaryGenre: string;
  awards: number;
  yearsActive: number;
}

export interface Comment {
  id: string;
  bookId: string;
  author: string;
  content: string;
  createdAt?: string;
}
