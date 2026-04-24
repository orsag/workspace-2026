import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Prisma } from '../../../generated/prisma/client';
import {
  ActionResponse,
  Book,
  DefaultSortParams,
  FindAllParams,
  PriceSortParams,
} from '@test-monorepo/libs';
type BookWithEffectivePrice = Book & { effectivePrice: number };

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateBookDto) {
    return this.prisma.client.book.create({ data });
  }

  async findAll(params: FindAllParams) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      isBestSeller,
      newReleases,
      isAvailable,
      isDiscounted,
      sortBy,
    } = params;

    const skip = (page - 1) * limit;

    const where = this.buildWhereClause({
      search,
      category,
      isBestSeller,
      newReleases,
      isAvailable,
      isDiscounted,
    });

    let data: Book[];
    const total = await this.prisma.client.book.count({ where });

    if (sortBy?.startsWith('price')) {
      data = await this.getSortedByPrice({
        where,
        limit,
        skip,
        sortBy,
        search,
      });
    } else {
      data = await this.getSortedByDefault({ where, limit, skip, sortBy });
    }

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  private buildWhereClause(params: FindAllParams) {
    const {
      search,
      category,
      isBestSeller,
      newReleases,
      isAvailable,
      isDiscounted,
    } = params;

    const where: Prisma.BookWhereInput = {};
    if (category?.trim()) where.category = category;
    if (isBestSeller === true) where.isBestSeller = true;
    if (newReleases === true) where.isNewArticle = true;
    if (isAvailable === true) where.isAvailable = true;
    if (isDiscounted === true) where.discount = { gt: 0 };

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  private async getSortedByPrice(params: PriceSortParams) {
    const { where, limit, skip, sortBy, search } = params;
    const direction =
      sortBy === 'price_asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

    if (where.category)
      conditions.push(Prisma.sql`category = ${where.category}`);
    if (where.isBestSeller) conditions.push(Prisma.sql`"isBestSeller" = true`);
    if (where.isAvailable) conditions.push(Prisma.sql`"isAvailable" = true`);
    if (where.discount) conditions.push(Prisma.sql`discount > 0`);
    if (where.isNewArticle) conditions.push(Prisma.sql`"isNewArticle" = true`);
    if (search?.trim()) {
      const searchPattern = `%${search}%`;
      conditions.push(
        Prisma.sql`(title ILIKE ${searchPattern} OR author ILIKE ${searchPattern} OR isbn ILIKE ${searchPattern})`,
      );
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    return this.prisma.client.$queryRaw<BookWithEffectivePrice[]>`
      SELECT *, (price * (1 - discount)) as "effectivePrice"
      FROM "Book"
      WHERE ${whereClause}
      ORDER BY (price * (1 - discount)) ${direction}, id ASC
      LIMIT ${limit} OFFSET ${skip}
    `;
  }

  private async getSortedByDefault(params: DefaultSortParams) {
    const { where, limit, skip, sortBy } = params;

    const orderBy: Prisma.BookOrderByWithRelationInput[] = [];

    switch (sortBy) {
      case 'popularity':
        orderBy.push({ popularity: 'desc' });
        break;
      case 'newest':
        orderBy.push({ publishedDate: 'desc' });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
    }
    orderBy.push({ id: 'asc' });

    return this.prisma.client.book.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    });
  }

  findSoldOut() {
    return this.prisma.client.book.findMany({
      where: { isSoldOut: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  getBooksByIds(ids: string[]) {
    return this.prisma.client.book.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.client.book.findUnique({ where: { id } });
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    const { createdAt, updatedAt, ...dataToUpdate } = updateBookDto as any;

    return this.prisma.client.book.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string): Promise<ActionResponse> {
    // 1. Check if the book is part of any existing orders
    const orderCount = await this.prisma.client.orderItem.count({
      where: { bookId: id },
    });

    // 2. If it is linked to orders, forbid deletion and return a warning
    if (orderCount > 0) {
      return {
        success: false,
        message: `Knihu nie je možné vymazať, pretože sa nachádza v ${orderCount} objednávkach.`,
        warning: true,
      };
    }

    // 3. Otherwise, proceed with standard deletion
    await this.prisma.client.book.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Kniha bola úspešne odstránená.',
    };
  }
}
