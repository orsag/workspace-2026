import { faker } from '@faker-js/faker';
import { prisma } from './prisma';
import { Prisma } from '../generated/prisma/client';

const games = [
  'ProductTypeKingdoms of Emberfall',
  'Trade Winds Caravan',
  'Mystic Forge Duel',
  'Harbor of Thieves',
  'Chronicle Architects',
  'Runes of the Lost Vale',
  'Skyport Tycoons',
  'Shadow Market',
  'Questline: Relics of Asteron',
  'Guildmasters’ Gambit',
];

const categories = [
  'Fiction',
  'Non-fiction',
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'History',
  'Biography',
  'Self-help',
  'Mystery',
];

async function main() {
  // Clear existing data
  await prisma.aggregateRating.deleteMany();
  await prisma.book.deleteMany();
  await prisma.game.deleteMany();
  await prisma.product.deleteMany();

  for (let i = 0; i < 100; i++) {
    const type = faker.helpers.arrayElement(['BOOK', 'GAME']);
    // const type = faker.helpers.arrayElement(Object.values(ProductType));
    const audioBook = Math.random() > 0.9;
    // 1. Create the Base Product
    const createInput: Prisma.ProductCreateInput = {
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name:
        type === 'BOOK'
          ? faker.commerce.productName()
          : type === 'GAME'
            ? faker.helpers.arrayElement(games)
            : faker.commerce.product(),
      alternativeHeadline: faker.company.catchPhrase(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      productType: type,
      availability: 'InStock',
      availableCount: faker.number.int({ min: 0, max: 50 }),
      deliveryLeadTime: faker.number.int({ min: 1, max: 7 }),
      coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      // 2. Create the Rating as a child
      rating: {
        create: {
          ratingValue: faker.number.float({
            min: 1,
            max: 5,
            fractionDigits: 1,
          }),
          ratingCount: faker.number.int({ min: 0, max: 1000 }),
          bestRating: 5,
          worstRating: 1,
        },
      },
    };

    if (type === 'BOOK') {
      createInput.bookDetails = {
        create: {
          author: faker.book.title(),
          isbn: faker.commerce.isbn(),
          publisher: faker.book.publisher(),
          pageCount: faker.number.int({ min: 100, max: 1000 }),
          bookFormat: faker.book.format(),
          category: faker.helpers.arrayElement(categories),
          binding: 'Smyth Sewn',
          publishedDate: faker.date.past(),
          audioBook: audioBook,
          audioLength: faker.number.int({ min: 100, max: 400 }),
          audioLanguage: 'Slovak',
        },
      };
    } else if (type === 'GAME') {
      createInput.gameDetails = {
        create: {
          category: 'Board Game',
          brand: 'Legion',
          playersMin: 2,
          playersMax: 6,
          playTimeMinutes: faker.number.int({ min: 20, max: 60 }),
          producer: faker.company.name(),
          item_weight: faker.number.int({ min: 100, max: 500 }),
        },
      };
    }

    await prisma.product.create({ data: createInput });
  }

  console.log('👤 Seeding Admin...');
  await prisma.user.upsert({
    where: { email: 'admin@bookstore.sk' }, // Unique identifier
    update: {}, // If found, do nothing
    create: {
      username: 'bossman',
      email: 'admin@bookstore.sk',
      isAdmin: true,
      phoneNumber: '+421 900 000 000',
      avatarUrl: faker.image.avatar(),
      theme: 'dark',
      favorites: [],
      cartItems: [],
    },
  });

  // 3. Handle Random Users
  const userCount = await prisma.user.count();
  if (userCount <= 1) {
    // Only the admin exists
    console.log('👥 Generating 2 random users...');
    const users = Array.from({ length: 2 }).map(() => ({
      username: faker.internet.username().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      isAdmin: false,
      phoneNumber: faker.phone.number(),
      avatarUrl: faker.image.avatar(),
      theme: 'light',
      favorites: [], // Empty as requested
      cartItems: [], // Empty as requested
      lastLogin: faker.date.recent(),
    }));

    await prisma.user.createMany({ data: users });
    console.log('✅ Seeded 2 users.');
  }
  await seedDetail();
}

async function seedDetail() {
  console.log('🚀 Starting to populate UserDetails...');

  // 1. Fetch all existing users
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    await prisma.userDetail.upsert({
      where: { userId: user.id },
      update: {}, // Don't change anything if it already exists
      create: {
        userId: user.id,
        // Using faker for that "Real App" feel
        isPremium: faker.datatype.boolean({ probability: 0.8 }),
        membershipStart: faker.date.past({ years: 1 }),
        membershipEnd: faker.date.future({ years: 1 }),
        displayName: faker.person.fullName(),
        addressLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        countryCode: 'SK', // Keeping it local to Zvolenská Slatina!
        avatarUrl: faker.image.avatar(),
        bio: faker.person.bio(),
        // If you added these to your model:
        iban: faker.finance.iban(),
        dateOfBirth: faker.date.birthdate(),
        lastActiveAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      },
    });
  }

  console.log(`✅ Success! Linked Details to ${allUsers.length} users.`);
}

main().finally(() => prisma.$disconnect());
