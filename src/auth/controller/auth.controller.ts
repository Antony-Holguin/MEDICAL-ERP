import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from '../services/auth/auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  SignUpPublicDto,
} from '@auth/dto';
import { ResponseAuthModel } from '@auth/models/responseAuth';
import { JwtAuthGuard } from '@auth/guards/auth/auth.guard';
import { Public } from '@auth/decorators';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    type: SignInDto,
    description: 'User email and password',
  })
  @ApiOkResponse({
    description: 'Successful login',
    type: ResponseAuthModel,
  })
  @Public()
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() credentials: SignInDto) {
    return this.authService.login(credentials);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiBody({
    type: SignUpPublicDto,
    description: 'User registration data',
  })
  @ApiOkResponse({
    description: 'User registered successfully',
    type: ResponseAuthModel,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Public()
  register(@Body() credentials: SignUpPublicDto) {
    return this.authService.register({ ...credentials, rolId: undefined });
  }

  @Post('create-user')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({
    type: SignUpDto,
    description: 'User data to create',
  })
  @ApiOkResponse({
    description: 'User created successfully',
    type: ResponseAuthModel,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createUser(@Body() credentials: SignUpDto) {
    return this.authService.register(credentials);
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({
    type: ForgetPasswordDto,
    description: 'User email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset request sent successfully',
  })
  @Public()
  forgetPassword(@Body('email') email: string) {
    return this.authService.forgetPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Token and new password',
  })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @Public()
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Id, current password and new password',
  })
  @ApiOkResponse({ description: 'Password changed successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}
