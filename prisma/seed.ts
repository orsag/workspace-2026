import { faker } from '@faker-js/faker';
import { prisma } from './prisma';

async function main() {
  const books = Array.from({ length: 100 }).map(() => ({
    title: faker.lorem.words({ min: 2, max: 5 }),
    author: faker.person.fullName(),
    isbn: faker.commerce.isbn(), // or faker.commerce.isbn() if you want real ISBNs
    publishedDate: faker.date.past({ years: 30 }),
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    pageCount: faker.number.int({ min: 80, max: 800 }),
    category: faker.helpers.arrayElement([
      'Fiction',
      'Non-fiction',
      'Fantasy',
      'Sci-Fi',
      'Romance',
      'History',
      'Biography',
      'Self-help',
      'Mystery',
    ]),
  }));

  await prisma.book.createMany({
    data: books,
  });

  console.log('Seeded 100 books.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
