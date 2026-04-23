import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { BookModule } from '../book/book.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { UserDetailModule } from '../user-detail/user-detail.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    AuthModule,
    BookModule,
    PrismaModule,
    OrderModule,
    UserDetailModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
