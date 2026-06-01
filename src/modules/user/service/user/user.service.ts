import {
  Injectable,
  UnprocessableEntityException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { PayloadModel } from 'src/auth/models/payloadModel';
import { UserDto } from '../../dto/user.dto';
import { PaginationResult } from 'src/core/models/paginationResult';
import { UserMapper } from '../../mapper/user.mapper';
import { UserRepository } from '../../repository/user.repository';
import { FilterUserDto } from '../../dto/filter-user.dto';
import { buildContainsCondition } from '@core/utils/buildWhereCondition.utils';
import { UserEntity } from '../../entity/user.entity';
import { UserRolService } from '..';
import { RolService } from '@modules/rol/service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _userMapper: UserMapper,
    private readonly _userRolService: UserRolService,
    private readonly _rolService: RolService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto | null> {
    try {
      this.logger.log('Creating user');
      const userEncrypted = this._userMapper.toEntityEncrypted(createUserDto);
      const newUser = await this._userRepository.create(userEncrypted);
      await this._userRolService.createUserRol(newUser.id, [
        createUserDto.rolId,
      ]);
      const rol = await this._rolService.findOne(createUserDto.rolId);
      this.logger.log('User created');
      return this._userMapper.toDto(newUser, rol);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateUser(payload: PayloadModel): Promise<boolean> {
    const user = await this.findByEmail(payload.email);
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    return !!user;
  }

  async findAll(
    options: FilterUserDto,
    allActive?: boolean,
  ): Promise<PaginationResult<UserDto>> {
    try {
      const { page, limit } = options;

      const basicFilter = this.buildWhereConditions(options);

      const users = await this._userRepository.findAll(
        basicFilter,
        limit,
        page,
      );

      if (!users)
        throw new HttpException('No users found', HttpStatus.NO_CONTENT);
      return {
        results: users.map((user) =>
          this._userMapper.toDto(user, user.roles[0]?.rol),
        ),
        total: await this._userRepository.getTotalCount(allActive),
        page,
        limit,
      };
    } catch (error) {
      throw new HttpException(error, error.status);
    }
  }

  async findOne(id: string): Promise<UserDto> {
    try {
      this.logger.log('Searching user by ID');
      const user = await this._userRepository.findBy('id', id);
      if (!user)
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      return this._userMapper.toDto(user, user.roles[0].rol);
    } catch (error) {
      throw new HttpException(error, error.status);
    }
  }

  async findAllByRole(rolId: string): Promise<UserDto[]> {
    try {
      const usersWithRoles = await this._userRolService.findUsersByRol(rolId);

      if (!usersWithRoles)
        throw new HttpException(
          'No users found for the specified role',
          HttpStatus.NOT_FOUND,
        );

      console.log(rolId);

      return usersWithRoles.map((userWithRol) =>
        this._userMapper.toDto(userWithRol.user, userWithRol.rol),
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    this.logger.log('Searching user by email');
    const encryptedEmail = this._userMapper.toEncryptedEmail(email);
    const userDb = await this._userRepository.findBy(
      'emailHash',
      encryptedEmail,
    );
    return this._userMapper.toEntityDecrypted(userDb);
  }

  async findByDni(dni: string) {
    this.logger.log('Searching user by dni');
    return await this._userRepository.findBy('dni', dni);
  }

  async changeRole(userId: string, rolId: string) {
    try {
      const user = await this.findOne(userId);
      if (!user) throw new UnprocessableEntityException('User does not exist');
      const result = await this._userRolService.updateUserRols(userId, [rolId]);

      if (!result)
        throw new UnprocessableEntityException('Could not update role');
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto | null> {
    const user = await this.findOne(userId);
    if (!user) throw new UnprocessableEntityException('User does not exist');
    try {
      const updatedUser = await this._userRepository.update(
        userId,
        updateUserDto,
      );
      const rol = updatedUser.roles[0]?.rol;
      return this._userMapper.toDto(updatedUser, rol);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async updatePassword(
    userId: string,
    password: string,
  ): Promise<UserDto | null> {
    try {
      const user = await this.findOne(userId);
      if (!user) throw new UnprocessableEntityException('User does not exist');
      const updatedUser = await this._userRepository.updatePassword(
        userId,
        password,
      );
      const rol = updatedUser.roles[0]?.rol;
      return this._userMapper.toDto(updatedUser, rol);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async remove(id: string): Promise<HttpException | void> {
    try {
      await this._userRepository.softDelete(id);
      return new HttpException('User deleted', HttpStatus.OK);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  private buildWhereConditions(options: FilterUserDto) {
    return {
      dni: buildContainsCondition(options.identification),
      name: buildContainsCondition(options.name),
      email: buildContainsCondition(options.email),
    };
  }
}
