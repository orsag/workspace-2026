import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    const tempUserId = 'cmno56rf50000i25jfqiqxmu5'; // Temporarily hardcode a valid User ID from your DB
    return this.orderService.create(tempUserId, createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.orderService.findAllByUser(userId);
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id') id: string) {
    return this.orderService.cancel(id);
  }
}
