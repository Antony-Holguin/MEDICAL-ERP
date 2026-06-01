import { RolEntity } from '@modules/rol/entities/rol.entity';
import { UserRolRepository } from '@modules/user/repository';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserRolService {
  private readonly logger = new Logger(UserRolService.name);
  constructor(private readonly _userRolRepository: UserRolRepository) {}

  async createUserRol(userId: string, rolsId: string[]) {
    try {
      return await this._userRolRepository.create(userId, rolsId);
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findRolesByUser(userId: string): Promise<RolEntity[]> {
    try {
      const userRols = await this._userRolRepository.findAllByUserId(userId);
      const rolesAssigned: RolEntity[] = userRols.map((ur) => ur.rol);
      return rolesAssigned;
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUsersByRol(rolId: string) {
    try {
      const rolesWithUsers =
        await this._userRolRepository.findUsersByRol(rolId);
      if (!rolesWithUsers || rolesWithUsers.length === 0) {
        throw new HttpException(
          'No users found for the specified role',
          HttpStatus.NOT_FOUND,
        );
      }
      return rolesWithUsers;
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserRols(userId: string, rolId: string[]) {
    return await this._userRolRepository.update(userId, rolId);
  }

  async deleteUserRols(userId: string) {
    return await this._userRolRepository.deleteByUserId(userId);
  }

  async checkUserPermissionsByRole(userId: string) {
    try {
      return await this._userRolRepository.checkUserPermissionsByRole(userId);
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifies if the user has at least one of the required roles
   */
  async checkUserRoles(
    userId: string,
    requiredRoles: string[],
  ): Promise<boolean> {
    try {
      const userRoles = await this._userRolRepository.checkUserRoles(
        userId,
        requiredRoles,
      );
      return userRoles.length > 0;
    } catch (error) {
      this.logger.error(
        `Error validation roles for user ${userId} with required roles ${requiredRoles.join(', ')}: ${error.message}`,
      );
      return false;
    }
  }
}
