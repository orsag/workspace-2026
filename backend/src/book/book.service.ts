import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Prisma } from '../../../generated/prisma/client';
import { ActionResponse } from '@test-monorepo/libs';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateBookDto) {
    return this.prisma.client.book.create({ data });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string; // Title/Author search
    category?: string;
    isBestSeller?: boolean;
    newReleases?: boolean;
    isAvailable?: boolean;
    isDiscounted?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity';
  }) {
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

    const where: Prisma.BookWhereInput = {};

    if (category && category.trim().length > 0) {
      where.category = category;
    }

    // 2. Handle Booleans (ensure we only filter if they are actually 'true')
    if (isBestSeller === true) where.isBestSeller = true;
    if (newReleases === true) where.isNewArticle = true;
    if (isAvailable === true) where.isAvailable = true;
    if (isDiscounted === true)
      where.discount = {
        gt: 0.0,
      };

    if (search && search.trim() !== '') {
      // 3. Handle Search (Only if search has actual characters)
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 2. Build Dynamic Sort
    const orderBy: Prisma.BookOrderByWithRelationInput[] = [];

    switch (sortBy) {
      case 'price_asc':
        orderBy.push({ price: 'asc' });
        break;
      case 'price_desc':
        orderBy.push({ price: 'desc' });
        break;
      case 'popularity':
        orderBy.push({ popularity: 'desc' });
        break;
      case 'newest':
        orderBy.push({ publishedDate: 'desc' });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
    }
    // ALWAYS add a tie-breaker as the last sorting rule
    orderBy.push({ id: 'asc' });

    // 3. Execute Parallel Queries
    const [data, total] = await Promise.all([
      this.prisma.client.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.client.book.count({ where }),
    ]);

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
