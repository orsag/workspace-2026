import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@test-monorepo/libs';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    // 🛡️ We use a transaction to ensure either everything succeeds or nothing does
    return this.prisma.client.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        // 1. Fetch current price directly from DB (never trust frontend prices!)
        const book = await tx.book.findUnique({ where: { id: item.bookId } });
        if (!book) throw new NotFoundException(`Book ${item.bookId} not found`);

        // 🛡️ STOCK CHECK: Prevent ordering more than available
        if (book.availableCount < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${book.title}". Available: ${book.availableCount}`,
          );
        }

        totalAmount += book.price * item.quantity;

        // 2. Prepare the item data
        orderItemsData.push({
          bookId: item.bookId,
          quantity: item.quantity,
          price: book.price, // Locking the price at the time of purchase
        });

        // 2. DECREASE STOCK: Use atomic decrement to avoid race conditions
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            availableCount: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Create the order and its items in one relational query
      return tx.order.create({
        data: {
          user: { connect: { id: userId } },
          totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { book: true }, // Return book details for the "Thank You" page
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.client.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.client.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } } },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }

  // backend/src/order/order.service.ts

  // Fetch all orders for a specific user with items and book details
  findAllByUser(userId: string) {
    return this.prisma.client.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { book: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Cancel an order if within 14 days
  async cancel(id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Backend validation for the 14-day cancellation window
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    if (order.createdAt < fourteenDaysAgo) {
      throw new BadRequestException(
        'Orders older than 14 days cannot be cancelled',
      );
    }

    // Perform the cancellation
    return this.prisma.client.order.update({
      where: { id },
      data: { status: 'CANCELLED' }, // Assuming your Enum or string is 'CANCELLED'
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.client.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
  }
}
