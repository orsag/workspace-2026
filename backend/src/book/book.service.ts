import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Prisma } from '@prisma-client';

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
    isNew?: boolean;
    isAvailable?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity';
  }) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      isBestSeller,
      isNew,
      isAvailable,
      sortBy,
    } = params;

    console.log(JSON.stringify(params));

    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    if (category && category.trim().length > 0) {
      where.category = category;
    }

    // 2. Handle Booleans (ensure we only filter if they are actually 'true')
    if (isBestSeller === true) where.isBestSeller = true;
    if (isNew === true) where.isNewArticle = true;
    if (isAvailable === true) where.isAvailable = true;

    // 3. Handle Search (Only if search has actual characters)
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { isbn: { contains: search } },
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

  findOne(id: string) {
    return this.prisma.client.book.findUnique({ where: { id } });
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    return this.prisma.client.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  remove(id: string) {
    return this.prisma.client.book.delete({ where: { id } });
  }
}
