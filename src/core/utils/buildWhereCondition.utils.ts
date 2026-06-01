import { Prisma } from 'src/generated/prisma/client';

export const buildContainsCondition = (
  value?: string,
): Prisma.StringFilter | undefined => {
  return value
    ? { contains: value, mode: Prisma.QueryMode.insensitive }
    : undefined;
};

export const buildContainsNameCondition = (key: string, value?: string) => {
  return value
    ? {
        [key]: {
          contains: value,
          mode: Prisma.QueryMode.insensitive,
        },
      }
    : undefined;
};
