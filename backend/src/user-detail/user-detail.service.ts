import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserDetailService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const userDetail = await this.prisma.client.userDetail.findUnique({
      where: { userId: userId },
    });

    if (!userDetail)
      throw new NotFoundException(`User detail with ID ${userId} not found`);
    return userDetail;
  }

  async update(userId: string, updateData: UpdateUserDetailDto) {
    return this.prisma.client.userDetail.update({
      where: { userId },
      data: {
        ...updateData,
        // If you need to manually force a conversion for any reason:
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
      },
    });
  }

  create(createUserDetailDto: CreateUserDetailDto) {
    return 'This action adds a new userDetail';
  }

  findAll() {
    return `This action returns all userDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} userDetail`;
  }
}
