import { Module, Global } from '@nestjs/common';
import { EncryptionService, SystemLogService } from './services';
import { EXCEL_READER, XlsxExcelReaderService } from './services/excel';
import { PrismaModule } from '@prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    EncryptionService,
    SystemLogService,
    {
      provide: EXCEL_READER,
      useClass: XlsxExcelReaderService,
    },
  ],
  exports: [EncryptionService, SystemLogService, EXCEL_READER],
})
export class CoreModule {}
