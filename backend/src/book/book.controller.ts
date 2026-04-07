import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isBestSeller') isBestSeller?: string, // Comes as string 'true'
    @Query('newReleases') newReleases?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('isDiscounted') isDiscounted?: string,
    @Query('sortBy')
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity',
  ) {
    return this.bookService.findAll({
      page,
      limit,
      search,
      category,
      isBestSeller: isBestSeller === 'true',
      newReleases: newReleases === 'true',
      isAvailable: isAvailable === 'true',
      isDiscounted: isDiscounted === 'true',
      sortBy,
    });
  }

  @Get('/sold')
  findSoldOut() {
    return this.bookService.findSoldOut();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
