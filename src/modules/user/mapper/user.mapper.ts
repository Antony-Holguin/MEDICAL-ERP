import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto } from '../dto';
import { UserEntity } from '../entity/user.entity';
import { EncryptionService } from '@core/services';
import { RolDto } from '@modules/rol/dto';

@Injectable()
export class UserMapper {
  constructor(private readonly encryptionService: EncryptionService) {}

  toDto(entity: UserEntity, rolDto: RolDto): UserDto {
    if (!entity) return null;
    const name = this.encryptionService.decryptData(entity.name);
    const lastName = this.encryptionService.decryptData(entity.lastName);
    return {
      id: entity.id,
      name,
      lastName,
      email: this.encryptionService.decryptData(entity.email),
      state: entity.state,
      completeName: `${name} ${lastName}`,
      rol: rolDto ? rolDto.name : '0',
      rolId: rolDto ? rolDto.id : '0',
    };
  }

  toEntityEncrypted(dto: CreateUserDto): UserEntity {
    const entity = new UserEntity();
    entity.name = this.encryptionService.encryptData(dto.name);
    entity.lastName = this.encryptionService.encryptData(dto.lastName);
    entity.email = this.encryptionService.encryptData(dto.email);
    entity.emailHash = this.encryptionService.generateHMAC(dto.email);
    entity.password = dto.password;
    return entity;
  }

  toEncryptedEmail(email: string): string {
    return this.encryptionService.generateHMAC(email);
  }

  toEntityDecrypted(entity: UserEntity): UserEntity {
    if (!entity) return null;
    entity.name = this.encryptionService.decryptData(entity.name);
    entity.lastName = this.encryptionService.decryptData(entity.lastName);
    entity.email = this.encryptionService.decryptData(entity.email);
    return entity;
  }
}
