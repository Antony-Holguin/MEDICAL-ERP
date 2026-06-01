import { Prisma } from 'src/generated/prisma/client';

export interface PrismaWhereOptions {
  stringFilter: Prisma.StringFilter;
  booleanFilter: Prisma.BoolFilter;
  dateTimeFilter: Prisma.DateTimeFilter;
}

export interface PaginationFilter {
  [x: string]: Prisma.StringFilter | Prisma.BoolFilter | undefined;
  name: Prisma.StringFilter | undefined;
  code: Prisma.StringFilter | undefined;
  state: Prisma.BoolFilter | undefined;
}
