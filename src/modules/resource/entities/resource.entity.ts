import { Resource } from '@generated/prisma/client';

export class ResourceEntity implements Resource {
  name: string;
  id: string;
  description: string;
  module: string;
  state: boolean;
  createdAt: Date;
  updatedAt: Date;
}
