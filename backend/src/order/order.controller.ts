import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Ensure the user is logged in
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    // Use the ID from the JWT payload instead of the hardcoded one
    const userId = req.user.userId;

    return this.orderService.create(userId, createOrderDto);
  }

  @Get('all')
  findAllGlobal() {
    return this.orderService.findAll(); // Assuming this returns everything
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

  // 2. Administration: Generic status update
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateStatus(id, status);
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
