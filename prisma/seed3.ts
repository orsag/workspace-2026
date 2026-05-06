import { faker } from '@faker-js/faker';
import { prisma } from './prisma';

async function main() {
  const bookCount = await prisma.book.count();

  if (bookCount === 0) {
    const books = Array.from({ length: 1000 }).map(() => {
      const price = parseFloat(
        faker.commerce.price({ min: 9, max: 250, dec: 2 }),
      );
      const availableCount = faker.number.int({ min: 0, max: 50 });
      const isBestSeller = Math.random() > 0.85; // 15% chance

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
        discount: faker.helpers.arrayElement([0, 0, 0, 0, 0.1, 0.2]), // Most have 0, some have big deals
        popularity: isBestSeller
          ? faker.number.int({ min: 8, max: 10 })
          : faker.number.int({ min: 0, max: 7 }),
        availableCount: availableCount,
        isAvailable: availableCount > 0,
        isSoldOut: availableCount === 0,
        isBestSeller: isBestSeller,
        coverUrl: `https://picsum.photos/seed/${faker.string.uuid()}/400/600`,
      };
    });

    // await prisma.product.createMany({ data: books });
    console.log('✅ Seeded 1000 books.');
  } else {
    console.log(`ℹ️ Skipping book seed: ${bookCount} books already exist.`);
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
    console.log('👥 Generating 10 random users...');
    const users = Array.from({ length: 10 }).map(() => ({
      username: faker.internet.username().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      isAdmin: false,
      phoneNumber: faker.phone.number(),
      avatarUrl: faker.image.avatar(),
      theme: faker.helpers.arrayElement(['light', 'dark']),
      favorites: [], // Empty as requested
      cartItems: [], // Empty as requested
      lastLogin: faker.date.recent(),
    }));

    await prisma.user.createMany({ data: users });
    console.log('✅ Seeded 10 users.');
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
