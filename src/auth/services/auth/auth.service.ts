import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PayloadModel } from '../../models/payloadModel';
import { UserService } from '@modules/user/service/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthModel } from '../../models/responseAuth';
import {
  ChangePasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '@auth/dto';
import { HashPasswordService } from '..';
import { MailQueueService } from '@modules/mail/services';
import { RolService } from '@modules/rol/service';
import { UserRolService } from '@modules/user/service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly _mailQueueService: MailQueueService,
    private readonly _userService: UserService,
    private readonly _jwtService: JwtService,
    private readonly _hashPasswordService: HashPasswordService,
    private readonly _userRolService: UserRolService,
    private readonly _rolService: RolService,
  ) {}

  async login(credentials: SignInDto): Promise<ResponseAuthModel> {
    this.logger.log(`Login attempt for ${credentials.email}`);
    const user = await this._userService.findByEmail(credentials.email);
    if (!user) {
      this.logger.log(`User not found ${credentials.email}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!user.state) throw new UnauthorizedException('Inactive user');
    const isMatch = await this.comparePassword(
      credentials.password,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    // Obtener roles del usuario
    const userRoles = await this._userRolService.findRolesByUser(user.id);

    const payload: PayloadModel = {
      id: user.id,
      email: user.email,
      name: `${user.name} ${user.lastName}`,
      roles: userRoles.map((ur) => ur.code),
    };

    this.logger.log(
      `Login success for ${credentials.email} with roles: ${payload.roles.join(', ')}`,
    );
    return {
      accessToken: await this.createToken(payload),
      user: await this._userService.findOne(user.id),
    };
  }

  async register(register: SignUpDto): Promise<HttpException> {
    const { email } = register;
    const existEmail = await this._userService.findByEmail(email);
    if (existEmail)
      throw new UnprocessableEntityException('User already exists');
    const salt = this._hashPasswordService.generateSalt();
    const password = await this.hashPassword(register.password, salt);

    let rolId: string = register.rolId;
    if (!rolId) {
      rolId = (await this._rolService.findDefault()).id;
    }
    try {
      await this._userService.create({
        ...register,
        password,
        rolId: rolId,
      });
      this.logger.log(`Create success for ${register.email}`);
      this._mailQueueService.sendMailNewUser(
        register.email,
        `${register.name} ${register.lastName}`,
      );
      return new HttpException('User created', HttpStatus.CREATED);
    } catch (error) {
      //console.log(error)
      this.logger.error(error);
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createToken(payload: PayloadModel): Promise<string> {
    try {
      const token = await this._jwtService.signAsync(payload);
      return token;
    } catch (error) {
      this.logger.error('Error creating JWT token', error.stack);
      throw new UnauthorizedException(`JWT token error ${error}`);
    }
  }

  async verifyToken(token: string): Promise<PayloadModel> {
    try {
      const payload = await this._jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      this.logger.error('JWT token error', error.stack);
      throw new UnauthorizedException('Session time has expired');
    }
  }

  async forgetPassword(email: string): Promise<HttpException> {
    const userExist = await this._userService.findByEmail(email);
    if (!userExist)
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    if (!userExist.state)
      throw new HttpException('User is inactive/blocked', HttpStatus.OK);
    const token = await this._jwtService.signAsync(
      {
        id: userExist.id,
        email: userExist.email,
      },
      { expiresIn: '5m' },
    );
    const fullName = `${userExist.email}`;
    this._mailQueueService.sendForgetPasswordEmail(email, token, fullName);
    return new HttpException('Email sent successfully', HttpStatus.OK);
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<HttpException> {
    try {
      const payload = await this.verifyToken(resetPasswordDto.token);
      if (!payload)
        throw new HttpException(
          'Token is not valid',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      const userExist = await this._userService.findByEmail(payload.email);
      if (!userExist)
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
      if (!userExist.state)
        throw new HttpException(
          'User is inactive/blocked',
          HttpStatus.CONFLICT,
        );
      const salt = this._hashPasswordService.generateSalt();
      const newPassword = await this.hashPassword(
        resetPasswordDto.newPassword,
        salt,
      );
      const ok = await this._userService.updatePassword(
        userExist.id,
        newPassword,
      );
      if (!ok)
        throw new HttpException(
          'Error updating password',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      this._mailQueueService.sendConfirmResetPasswordEmail(
        userExist.email,
        `${userExist.name} ${userExist.lastName}`,
      );
      return new HttpException('Password updated', HttpStatus.OK);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<HttpException> {
    const userExist = await this._userService.findByEmail(
      changePasswordDto.email,
    );
    if (!userExist)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    if (!userExist.state)
      throw new HttpException('User is inactive/blocked', HttpStatus.CONFLICT);
    const isMatch = await this.comparePassword(
      changePasswordDto.currentPassword,
      userExist.password,
    );
    if (!isMatch)
      throw new HttpException(
        'Current password does not match',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    const salt = this._hashPasswordService.generateSalt();
    const newPassword = await this.hashPassword(
      changePasswordDto.newPassword,
      salt,
    );
    const changed = await this._userService.updatePassword(
      userExist.id,
      newPassword,
    );
    if (!changed)
      throw new HttpException(
        'Error updating password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    this._mailQueueService.sendConfirmResetPasswordEmail(
      userExist.email,
      `${userExist.name} ${userExist.lastName}`,
    );
    return new HttpException('Password updated', HttpStatus.OK);
  }

  async validateToken(payload: PayloadModel): Promise<PayloadModel> {
    const isValid = await this._userService.validateUser(payload);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token or inactive user');
    }

    // Reload roles in case they have changed since the token was generated
    const userRoles = await this._userRolService.findRolesByUser(payload.id);

    return {
      ...payload,
      roles: userRoles.map((ur) => ur.code),
    };
  }

  async comparePassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return this._hashPasswordService.verifyPassword(
      password,
      storedPasswordHash,
    );
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return await this._hashPasswordService.hashPassword(password, salt);
  }
}
