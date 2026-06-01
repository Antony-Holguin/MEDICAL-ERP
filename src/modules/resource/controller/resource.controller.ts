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
import { ResourceService } from '../service/resource.service';
import { CreateResourceDto, ResourceDto, UpdateResourceDto } from '../dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResult } from '@core/models';
import { FilterResourceDto } from '../dto/filter-resource.dto';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';

@ApiTags('Resource')
@ApiBearerAuth()
@Controller('resource')
export class ResourceController {
  constructor(private readonly _resourceService: ResourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiProperty({
    description: 'Data for creating a new resource',
    type: CreateResourceDto,
  })
  @ApiOkResponse({
    description: 'Resource created successfully',
    type: ResourceDto,
  })
  @UseGuards(JwtAuthGuard)
  create(@Body() createResourceDto: CreateResourceDto) {
    return this._resourceService.create(createResourceDto);
  }

  @Post('all')
  @ApiOperation({ summary: 'Get all resources' })
  @ApiProperty({
    description: 'List of all resources',
    type: FilterResourceDto,
  })
  @ApiOkResponse({
    description: 'Resources retrieved successfully',
    type: PaginationResult<ResourceDto>,
  })
  @UseGuards(JwtAuthGuard)
  findAll(@Body() filterResourceDto: FilterResourceDto) {
    return this._resourceService.findAll(filterResourceDto);
  }

  @Post('active')
  @ApiOperation({ summary: 'Get all active resources' })
  @ApiProperty({
    description: 'List of all active resources',
    type: FilterResourceDto,
  })
  @ApiOkResponse({
    description: 'Active resources retrieved successfully',
    type: PaginationResult<ResourceDto>,
  })
  @UseGuards(JwtAuthGuard)
  findAllActive(@Body() filterResourceDto: FilterResourceDto) {
    return this._resourceService.findAll(filterResourceDto, true);
  }

  @Get(':id')
  @ApiProperty({
    description: 'ID of the resource to retrieve',
    type: 'string',
  })
  @ApiOperation({ summary: 'Get a resource by ID' })
  @ApiOkResponse({
    description: 'Resource retrieved successfully',
    type: ResourceDto,
  })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this._resourceService.findOne(id);
  }

  @Patch(':id')
  @ApiProperty({
    description: 'ID of the resource to update',
    type: 'string',
  })
  @ApiOperation({ summary: 'Update a resource by ID' })
  @ApiOkResponse({
    description: 'Resource updated successfully',
    type: ResourceDto,
  })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this._resourceService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @ApiProperty({
    description: 'ID of the resource to delete',
    type: 'string',
  })
  @ApiOperation({ summary: 'Delete a resource by ID' })
  @ApiOkResponse({
    description: 'Resource deleted successfully',
  })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this._resourceService.remove(id);
  }
}
