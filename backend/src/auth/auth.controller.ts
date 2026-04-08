import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from '@test-monorepo/shared-models';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { username: string }) {
    return this.authService.logout(body.username);
  }

  @Get()
  async getUser(@Query('username') username: string) {
    return this.authService.findByUsername(username);
  }

  @Patch('favorites')
  async updateFavorites(
    @Body() body: { username: string; favorites: string[] },
  ) {
    return this.authService.updateFavorites(body.username, body.favorites);
  }

  @Patch('update')
  async updateProfile(
    @Body()
    body: {
      username: string;
      updates: { email: string; phoneNumber: string; theme: string };
    },
  ) {
    // We only pass the specific allowed fields to the service
    return this.authService.updateProfile(body.username, body.updates);
  }
}
