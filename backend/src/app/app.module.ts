import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { BookModule } from '../book/book.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [AuthModule, BookModule, PrismaModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
