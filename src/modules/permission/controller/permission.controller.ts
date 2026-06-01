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
import { PermissionService } from '../service/permission.service';
import {
  CreatePermissionDto,
  FilterPermissionDto,
  PermissionDto,
  UpdatePermissionDto,
} from '../dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResult } from '@core/models';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';

@ApiTags('Permission')
@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
  constructor(private readonly _permissionService: PermissionService) {}

  @Post()
  @ApiProperty({
    description: 'Create a new permission',
    type: PermissionDto,
  })
  @ApiOkResponse({
    description: 'Permission created successfully',
    type: PermissionDto,
  })
  @ApiOperation({
    summary: 'Create a new permission',
  })
  @UseGuards(JwtAuthGuard)
  create(@Body() createPermission: CreatePermissionDto) {
    return this._permissionService.create(createPermission);
  }

  @Post('all')
  @ApiProperty({
    description: 'Permission options for filtering and pagination',
    type: PaginationResult<PermissionDto>,
  })
  @ApiOperation({
    summary: 'Find all permissions with optional filtering and pagination',
  })
  @UseGuards(JwtAuthGuard)
  findAll(@Body() options: FilterPermissionDto) {
    return this._permissionService.findAll(options);
  }

  @Get(':id')
  @ApiProperty({
    description: 'Get a permission by its ID',
    type: PermissionDto,
  })
  @ApiOperation({ summary: 'Get permission by ID' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this._permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Permission updated successfully',
    type: PermissionDto,
  })
  @ApiOperation({ summary: 'Update a permission by ID' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this._permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Permission deleted successfully',
  })
  @ApiOperation({ summary: 'Delete a permission by ID' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this._permissionService.remove(id);
  }
}
