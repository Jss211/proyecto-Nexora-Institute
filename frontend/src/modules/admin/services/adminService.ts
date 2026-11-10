import { apiRequest } from '../../../services/apiClient';
import type { UserRole } from '../../../types/auth.types';
import type {
  AcademicPeriodItem,
  AdminUserItem,
  CourseItem,
  CreateCoursePayload,
  CreateEnrollmentPayload,
  CreatePeriodPayload,
  CreateProgramPayload,
  CreateSectionPayload,
  CreateUserPayload,
  DashboardSummary,
  EnrollmentItem,
  EnrollmentStatus,
  ProgramItem,
  SectionItem,
} from '../types/admin.types';

export const adminService = {
  getDashboardSummary: () =>
    apiRequest<DashboardSummary>('/academic/dashboard-summary'),

  listUsers: (role?: UserRole, search?: string, programId?: string) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (search?.trim()) params.set('search', search.trim());
    if (programId) params.set('programId', programId);
    const query = params.toString();
    return apiRequest<AdminUserItem[]>(`/users${query ? `?${query}` : ''}`);
  },

  createUser: (payload: CreateUserPayload) =>
    apiRequest<AdminUserItem>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggleUserStatus: (userId: string, isActive: boolean) =>
    apiRequest<AdminUserItem>(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  listPrograms: () => apiRequest<ProgramItem[]>('/academic/programs'),

  createProgram: (payload: CreateProgramPayload) =>
    apiRequest<ProgramItem>('/academic/programs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggleProgramStatus: (programId: string, isActive: boolean) =>
    apiRequest<ProgramItem>(`/academic/programs/${programId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  listPeriods: () => apiRequest<AcademicPeriodItem[]>('/academic/periods'),

  createPeriod: (payload: CreatePeriodPayload) =>
    apiRequest<AcademicPeriodItem>('/academic/periods', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  setCurrentPeriod: (periodId: string) =>
    apiRequest<AcademicPeriodItem>(`/academic/periods/${periodId}/current`, {
      method: 'PATCH',
    }),

  listCourses: () => apiRequest<CourseItem[]>('/academic/courses'),

  createCourse: (payload: CreateCoursePayload) =>
    apiRequest<CourseItem>('/academic/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listSections: () => apiRequest<SectionItem[]>('/academic/sections'),

  createSection: (payload: CreateSectionPayload) =>
    apiRequest<SectionItem>('/academic/sections', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listEnrollments: () => apiRequest<EnrollmentItem[]>('/enrollments'),

  createEnrollment: (payload: CreateEnrollmentPayload) =>
    apiRequest<EnrollmentItem>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus) =>
    apiRequest<EnrollmentItem>(`/enrollments/${enrollmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
