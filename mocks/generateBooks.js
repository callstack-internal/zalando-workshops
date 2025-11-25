const fs = require('fs');
const {faker} = require('@faker-js/faker');

const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Philosophy', 'Poetry'];

const generateRating = () => {
  const votes = faker.number.int({ min: 0, max: 35000 });

  if (votes === 0) {
    return { rating: 0, votes };
  }

  const rating = Number(
    faker.number.float({ min: 1, max: 5, multipleOf: 0.01 }).toFixed(2),
  );

  return { rating, votes };
};

const bigData = Array.from({ length: 5000 }, (_, i) => {
  const { rating, votes } = generateRating();

  return {
    id: i.toString(),
    title: faker.book.title(),
    authorId: faker.number.int({ min: 1, max: 3000 }).toString(),
    genre: faker.helpers.arrayElement(genres),
    publishedDate: faker.date.between({ from: '1900-01-01', to: '2023-12-31' }).toISOString(),
    lastRead: faker.date.between({ from: '2020-01-01', to: '2024-12-31' }).toISOString(),
    rating,
    votes,
  };
});

fs.writeFileSync(__dirname + '/books.json', JSON.stringify(bigData, null, 2));

console.log('Mock data generated: books.json');
