import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordWithTokenDto } from './dto/reset-password-with-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminAuthGuard } from './auth.guard';

interface AuthedRequest extends Request {
  user: { userId: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // Usado por el panel admin al cargar cualquier página, para saber quién es el
  // usuario actual y qué puede hacer (permisos), sin depender de lo guardado en el token viejo.
  @UseGuards(AdminAuthGuard)
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.authService.me(req.user.userId);
  }

  // Cualquier usuario logueado (admin o staff) puede cambiar su propia contraseña.
  @UseGuards(AdminAuthGuard)
  @Patch('change-password')
  changePassword(@Req() req: AuthedRequest, @Body() dto: ChangePasswordDto) {
    return this.authService.changeOwnPassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }

  // --- Recuperación de contraseña por correo (público, sin sesión) ---

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordWithTokenDto) {
    return this.authService.resetPasswordWithToken(dto.email, dto.token, dto.newPassword);
  }
}
