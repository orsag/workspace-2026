import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  isbn: string;

  @IsDateString()
  publishedDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  pageCount: number;

  @IsString()
  category: string;
}
