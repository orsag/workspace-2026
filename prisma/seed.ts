import { faker } from '@faker-js/faker';
import { myPrismaClient } from './prisma';

async function main() {
  const books = Array.from({ length: 1000 }).map(() => {
    const price = parseFloat(
      faker.commerce.price({ min: 9, max: 250, dec: 2 }),
    );
    const availableCount = faker.number.int({ min: 0, max: 50 });
    const isBestSeller = Math.random() > 0.85; // 15% chance
    const isNewArticle = Math.random() > 0.8;  // 20% chance

    return {
      title: faker.book.title(),
      author: faker.person.fullName(),
      isbn: faker.commerce.isbn(),
      publisher: faker.company.name(),
      publishedDate: faker.date.past({ years: 12 }),
      description: faker.lorem.paragraphs({ min: 1, max: 2 }), // Longer for your line-clamp tests
      pageCount: faker.number.int({ min: 80, max: 1200 }),
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

      price: price,
      discount: faker.helpers.arrayElement([0, 0, 0, 0.1, 0.2, 0.3, 0.5]), // Most have 0, some have big deals
      popularity: isBestSeller
        ? faker.number.int({ min: 8, max: 10 })
        : faker.number.int({ min: 0, max: 7 }),
      availableCount: availableCount,
      isAvailable: availableCount > 0,
      isSoldOut: availableCount === 0,
      isBestSeller: isBestSeller,
      isNewArticle: isNewArticle,
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
    };
  });

  await myPrismaClient.book.createMany({
    data: books,
  });

  console.log('Seeded 1000 books.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await myPrismaClient.$disconnect();
  });
