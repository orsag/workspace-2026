import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  isbn: string;

  @IsString()
  publisher: string; // New required field

  @IsDateString()
  publishedDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  pageCount: number;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  price: number; // New required field

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  discount?: number; // 0.0 to 1.0

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  popularity?: number;

  @IsInt()
  @Min(0)
  availableCount: number; // New required field

  @IsBoolean()
  @IsOptional()
  isNewArticle?: boolean;

  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;
}
