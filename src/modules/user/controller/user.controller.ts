import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth/auth.guard';
import { UserDto } from '../dto/user.dto';
import { UpdateUserResponseDto } from '../dto/update-user-response-dto';
import { PaginationResult } from 'src/core/models/paginationResult';
import { FilterUserDto } from '../dto/filter-user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('all')
  @ApiOkResponse({
    description: 'Users found',
    type: PaginationResult<UserDto>,
  })
  @ApiOperation({ summary: 'Find all users' })
  @UseGuards(JwtAuthGuard)
  findAll(@Body() options: FilterUserDto) {
    return this.userService.findAll(options);
  }

  @Post('active')
  @ApiOkResponse({
    description: 'Active users found',
    type: PaginationResult<UserDto>,
  })
  @ApiOperation({ summary: 'Find all active users' })
  @UseGuards(JwtAuthGuard)
  findAllActive(@Body() options: FilterUserDto) {
    return this.userService.findAll(options, true);
  }

  @Get('byRole/:id')
  @ApiOkResponse({
    type: UserDto,
    description: 'Users found by role',
    isArray: true,
  })
  @ApiOperation({ summary: 'Find all users by role' })
  @UseGuards(JwtAuthGuard)
  findAllByRole(@Param('id') id: string) {
    return this.userService.findAllByRole(id);
  }

  @ApiOkResponse({
    description: 'User found',
    type: UserDto,
  })
  @ApiNoContentResponse({
    description: 'User not found',
    type: null,
  })
  @ApiOperation({ summary: 'Find user by ID' })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOkResponse({
    description: 'User updated',
    type: UpdateUserResponseDto,
  })
  @ApiOperation({ summary: 'Update a user by ID' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Delete a user by ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Delete user by ID' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
