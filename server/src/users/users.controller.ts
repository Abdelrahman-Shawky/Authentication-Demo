import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { UserDocument } from './users.schema';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard) // require a valid JWT
  @Get('me')
  @ApiOkResponse({ description: 'Current user profile' })
  me(@GetUser() user: UserDocument) {
    return user;
  }
}
