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
import { RolService } from '../service/rol.service';
import { CreateRolDto, RolDto, UpdateRolDto } from '../dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';
import { FilterResourceDto } from '@modules/resource/dto/filter-resource.dto';
import { PaginationResult } from '@core/models';

@ApiTags('Rol')
@ApiBearerAuth()
@Controller('rol')
export class RolController {
  constructor(private readonly _rolService: RolService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rol' })
  @ApiProperty({
    description: 'Data for creating a new rol',
    type: CreateRolDto,
  })
  @ApiOkResponse({
    description: 'Rol created successfully',
    type: RolDto,
  })
  @UseGuards(JwtAuthGuard)
  create(@Body() createRolDto: CreateRolDto) {
    return this._rolService.create(createRolDto);
  }

  @Post('all')
  @ApiOperation({ summary: 'Get all rols' })
  @ApiProperty({
    description: 'List of all rols',
    type: FilterResourceDto,
  })
  @ApiOkResponse({
    description: 'Rols retrieved successfully',
    type: PaginationResult<RolDto>,
  })
  @UseGuards(JwtAuthGuard)
  findAll(@Body() filterResourceDto: FilterResourceDto) {
    return this._rolService.findAll(filterResourceDto);
  }

  @Post('active')
  @ApiOperation({ summary: 'Get all active rols' })
  @ApiProperty({
    description: 'List of all active rols',
    type: FilterResourceDto,
  })
  @ApiOkResponse({
    description: 'Active rols retrieved successfully',
    type: PaginationResult<RolDto>,
  })
  @UseGuards(JwtAuthGuard)
  findAllActive(@Body() filterResourceDto: FilterResourceDto) {
    return this._rolService.findAll(filterResourceDto, true);
  }

  @Get(':id')
  @ApiProperty({
    description: 'Get a rol by its ID',
    type: 'string',
  })
  @ApiOperation({ summary: 'Get rol by ID' })
  @ApiOkResponse({
    description: 'Rol retrieved successfully',
    type: RolDto,
  })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this._rolService.findOne(id);
  }

  @Patch(':id')
  @ApiProperty({
    description: 'Data for updating a rol',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Rol updated successfully',
    type: RolDto,
  })
  @ApiOperation({ summary: 'Update a rol by ID' })
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto) {
    return this._rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Rol deleted successfully',
  })
  @ApiOperation({ summary: 'Delete a rol by ID' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this._rolService.remove(id);
  }
}
