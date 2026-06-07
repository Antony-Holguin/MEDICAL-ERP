-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LIST', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'MANAGE');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRol" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "rolId" BIGINT NOT NULL,
    "assignedBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" BIGSERIAL NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "service" TEXT,
    "context" JSONB,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" BIGSERIAL NOT NULL,
    "resourceId" BIGINT NOT NULL,
    "action" "ActionType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolHasPermission" (
    "rolId" BIGINT NOT NULL,
    "permissionId" BIGINT NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" BIGINT,
    "modifiedBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolHasPermission_pkey" PRIMARY KEY ("rolId","permissionId")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "User"("emailHash");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_emailHash_idx" ON "User"("emailHash");

-- CreateIndex
CREATE INDEX "User_state_idx" ON "User"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_code_key" ON "Rol"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_name_key" ON "Rol"("name");

-- CreateIndex
CREATE INDEX "Rol_code_idx" ON "Rol"("code");

-- CreateIndex
CREATE INDEX "Rol_state_idx" ON "Rol"("state");

-- CreateIndex
CREATE INDEX "Rol_isSystem_idx" ON "Rol"("isSystem");

-- CreateIndex
CREATE INDEX "UserRol_userId_idx" ON "UserRol"("userId");

-- CreateIndex
CREATE INDEX "UserRol_rolId_idx" ON "UserRol"("rolId");

-- CreateIndex
CREATE INDEX "UserRol_assignedBy_idx" ON "UserRol"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "UserRol_userId_rolId_key" ON "UserRol"("userId", "rolId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_service_idx" ON "SystemLog"("service");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");

-- CreateIndex
CREATE INDEX "Resource_name_idx" ON "Resource"("name");

-- CreateIndex
CREATE INDEX "Resource_module_idx" ON "Resource"("module");

-- CreateIndex
CREATE INDEX "Resource_state_idx" ON "Resource"("state");

-- CreateIndex
CREATE INDEX "Permission_resourceId_idx" ON "Permission"("resourceId");

-- CreateIndex
CREATE INDEX "Permission_action_idx" ON "Permission"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resourceId_action_key" ON "Permission"("resourceId", "action");

-- CreateIndex
CREATE INDEX "RolHasPermission_rolId_idx" ON "RolHasPermission"("rolId");

-- CreateIndex
CREATE INDEX "RolHasPermission_permissionId_idx" ON "RolHasPermission"("permissionId");

-- CreateIndex
CREATE INDEX "RolHasPermission_state_idx" ON "RolHasPermission"("state");

-- CreateIndex
CREATE INDEX "RolHasPermission_createdBy_idx" ON "RolHasPermission"("createdBy");

-- AddForeignKey
ALTER TABLE "UserRol" ADD CONSTRAINT "UserRol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRol" ADD CONSTRAINT "UserRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRol" ADD CONSTRAINT "UserRol_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolHasPermission" ADD CONSTRAINT "RolHasPermission_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolHasPermission" ADD CONSTRAINT "RolHasPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolHasPermission" ADD CONSTRAINT "RolHasPermission_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolHasPermission" ADD CONSTRAINT "RolHasPermission_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
