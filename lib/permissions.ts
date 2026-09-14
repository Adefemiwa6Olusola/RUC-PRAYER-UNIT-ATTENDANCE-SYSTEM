import { UserRole } from '@prisma/client';

type Permission =
  | 'attendance:start'
  | 'attendance:mark'
  | 'attendance:view'
  | 'attendance:edit'
  | 'attendance:delete'
  | 'attendance:export'
  | 'students:view'
  | 'students:create'
  | 'students:edit'
  | 'students:delete'
  | 'students:import'
  | 'meetings:view'
  | 'meetings:create'
  | 'meetings:edit'
  | 'meetings:delete'
  | 'centres:view'
  | 'centres:create'
  | 'centres:edit'
  | 'centres:delete'
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'reports:view'
  | 'reports:export'
  | 'analytics:view'
  | 'audit:view'
  | 'settings:view'
  | 'settings:edit';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'attendance:start', 'attendance:mark', 'attendance:view', 'attendance:edit',
    'attendance:delete', 'attendance:export',
    'students:view', 'students:create', 'students:edit', 'students:delete', 'students:import',
    'meetings:view', 'meetings:create', 'meetings:edit', 'meetings:delete',
    'centres:view', 'centres:create', 'centres:edit', 'centres:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'reports:view', 'reports:export',
    'analytics:view',
    'audit:view',
    'settings:view', 'settings:edit',
  ],
  ADMIN: [
    'attendance:start', 'attendance:mark', 'attendance:view', 'attendance:edit',
    'attendance:export',
    'students:view', 'students:create', 'students:edit', 'students:import',
    'meetings:view', 'meetings:create', 'meetings:edit',
    'centres:view', 'centres:create', 'centres:edit',
    'users:view', 'users:create', 'users:edit',
    'reports:view', 'reports:export',
    'analytics:view',
    'audit:view',
    'settings:view',
  ],
  EXCO: [
    'attendance:start', 'attendance:mark', 'attendance:view', 'attendance:export',
    'students:view', 'students:create',
    'meetings:view',
    'centres:view',
    'reports:view', 'reports:export',
    'analytics:view',
  ],
  ATTENDANCE_OFFICER: [
    'attendance:start', 'attendance:mark', 'attendance:view',
    'students:view',
    'meetings:view',
    'centres:view',
    'reports:view',
  ],
  MEMBER: [
    'attendance:view',
    'students:view',
    'meetings:view',
    'centres:view',
    'reports:view',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccess(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    EXCO: 'Exco',
    ATTENDANCE_OFFICER: 'Attendance Officer',
    MEMBER: 'Member',
  };
  return labels[role] || role;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  EXCO: 3,
  ATTENDANCE_OFFICER: 2,
  MEMBER: 1,
};

export function isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
