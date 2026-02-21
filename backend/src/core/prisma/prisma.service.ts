import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as path from 'path';

// Load from project root at runtime so it works when running from dist/
const generatedPath = path.join(process.cwd(), 'generated', 'prisma');
const { PrismaClient } = require(generatedPath);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to database');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Could not connect to database (app will start anyway): ${message}. ` +
          'Ensure PostgreSQL is running and DATABASE_URL in .env is correct.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
