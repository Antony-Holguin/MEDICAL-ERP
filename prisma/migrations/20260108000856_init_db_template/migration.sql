-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LIST', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'MANAGE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
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
CREATE TABLE "public"."Rol" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRol" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" "public"."ActionType" NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolHasPermission" (
    "rolId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "modifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolHasPermission_pkey" PRIMARY KEY ("rolId","permissionId")
);

-- CreateTable
CREATE TABLE "public"."Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,
    "state" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
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
CREATE TABLE "public"."SystemLog" (
    "id" TEXT NOT NULL,
    "level" "public"."LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "service" TEXT,
    "context" JSONB,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "public"."User"("emailHash");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_emailHash_idx" ON "public"."User"("emailHash");

-- CreateIndex
CREATE INDEX "User_state_idx" ON "public"."User"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_code_key" ON "public"."Rol"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_name_key" ON "public"."Rol"("name");

-- CreateIndex
CREATE INDEX "Rol_code_idx" ON "public"."Rol"("code");

-- CreateIndex
CREATE INDEX "Rol_state_idx" ON "public"."Rol"("state");

-- CreateIndex
CREATE INDEX "Rol_isSystem_idx" ON "public"."Rol"("isSystem");

-- CreateIndex
CREATE INDEX "UserRol_userId_idx" ON "public"."UserRol"("userId");

-- CreateIndex
CREATE INDEX "UserRol_rolId_idx" ON "public"."UserRol"("rolId");

-- CreateIndex
CREATE INDEX "UserRol_assignedBy_idx" ON "public"."UserRol"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "UserRol_userId_rolId_key" ON "public"."UserRol"("userId", "rolId");

-- CreateIndex
CREATE INDEX "Permission_resourceId_idx" ON "public"."Permission"("resourceId");

-- CreateIndex
CREATE INDEX "Permission_actionId_idx" ON "public"."Permission"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resourceId_actionId_key" ON "public"."Permission"("resourceId", "actionId");

-- CreateIndex
CREATE INDEX "RolHasPermission_rolId_idx" ON "public"."RolHasPermission"("rolId");

-- CreateIndex
CREATE INDEX "RolHasPermission_permissionId_idx" ON "public"."RolHasPermission"("permissionId");

-- CreateIndex
CREATE INDEX "RolHasPermission_state_idx" ON "public"."RolHasPermission"("state");

-- CreateIndex
CREATE INDEX "RolHasPermission_createdBy_idx" ON "public"."RolHasPermission"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "public"."Resource"("name");

-- CreateIndex
CREATE INDEX "Resource_name_idx" ON "public"."Resource"("name");

-- CreateIndex
CREATE INDEX "Resource_module_idx" ON "public"."Resource"("module");

-- CreateIndex
CREATE INDEX "Resource_state_idx" ON "public"."Resource"("state");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "public"."AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "public"."AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "public"."SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_service_idx" ON "public"."SystemLog"("service");

-- CreateIndex
CREATE INDEX "SystemLog_createdAt_idx" ON "public"."SystemLog"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."UserRol" ADD CONSTRAINT "UserRol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRol" ADD CONSTRAINT "UserRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRol" ADD CONSTRAINT "UserRol_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolHasPermission" ADD CONSTRAINT "RolHasPermission_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "public"."Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolHasPermission" ADD CONSTRAINT "RolHasPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolHasPermission" ADD CONSTRAINT "RolHasPermission_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolHasPermission" ADD CONSTRAINT "RolHasPermission_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
