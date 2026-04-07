import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(loginDto: LoginDto) {
    const username = loginDto.username.toLowerCase();

    const user = await this.prisma.client.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp in Postgres
    return this.prisma.client.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
  }

  async findByUsername(username: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return user;
  }

  async logout(username: string) {
    // Logic: Ensure the user actually exists before "logging out"
    const user = await this.prisma.client.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional: You could update a field like `lastActive` here
    return {
      message: `User ${username} logged out successfully`,
      timestamp: new Date(),
    };
  }
}
