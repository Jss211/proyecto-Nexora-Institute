import type { UserRole } from '../../../types/auth.types';

export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'COMPLETED';

export type AdminSectionKey =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'programs'
  | 'courses'
  | 'periods'
  | 'enrollments'
  | 'sections'
  | 'grades'
  | 'attendance'
  | 'users'
  | 'reports';

export interface AdminUserItem {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly documentNumber: string | null;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly studentProfile: {
    readonly id: string;
    readonly studentCode: string;
    readonly currentCycle: number;
    readonly program: {
      readonly id: string;
      readonly code: string;
      readonly name: string;
    };
    readonly enrollments?: ReadonlyArray<{
      readonly id: string;
      readonly status: EnrollmentStatus;
      readonly section: {
        readonly code: string;
        readonly schedule: string;
        readonly course: {
          readonly code: string;
          readonly name: string;
        };
      };
      readonly grades: ReadonlyArray<{
        readonly id: string;
        readonly title: string;
        readonly score: number;
        readonly weight: number;
      }>;
    }>;
  } | null;
  readonly teacherProfile: {
    readonly id: string;
    readonly teacherCode: string;
    readonly specialty: string;
  } | null;
}

export interface ProgramItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly durationCycles: number;
  readonly isActive: boolean;
  readonly _count: {
    readonly courses: number;
    readonly students: number;
  };
}

export interface AcademicPeriodItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly isCurrent: boolean;
  readonly _count: {
    readonly sections: number;
  };
}

export interface CourseItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly credits: number;
  readonly cycleNumber: number;
  readonly programId: string;
  readonly isActive: boolean;
  readonly program: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
  };
  readonly _count: {
    readonly sections: number;
  };
}

export interface SectionItem {
  readonly id: string;
  readonly code: string;
  readonly schedule: string;
  readonly classroom: string;
  readonly capacity: number;
  readonly course: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly credits: number;
    readonly program: {
      readonly code: string;
      readonly name: string;
    };
  };
  readonly period: {
    readonly id: string;
    readonly code: string;
    readonly name: string;
    readonly isCurrent: boolean;
  };
  readonly teacher: {
    readonly id: string;
    readonly teacherCode: string;
    readonly specialty: string;
    readonly user: {
      readonly firstName: string;
      readonly lastName: string;
    };
  };
  readonly _count: {
    readonly enrollments: number;
  };
}

export interface EnrollmentItem {
  readonly id: string;
  readonly status: EnrollmentStatus;
  readonly enrolledAt: string;
  readonly student: {
    readonly id: string;
    readonly studentCode: string;
    readonly currentCycle: number;
    readonly user: {
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
    };
    readonly program: {
      readonly code: string;
      readonly name: string;
    };
  };
  readonly section: {
    readonly id: string;
    readonly code: string;
    readonly schedule: string;
    readonly classroom: string;
    readonly course: {
      readonly code: string;
      readonly name: string;
    };
    readonly period: {
      readonly code: string;
      readonly name: string;
    };
  };
}

export interface ProgramDistributionItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly studentCount: number;
  readonly courseCount: number;
}

export interface MonthlyGrowthPoint {
  readonly label: string;
  readonly students: number;
  readonly enrollments: number;
}

export interface RecentEnrollmentSummary {
  readonly id: string;
  readonly studentCode: string;
  readonly studentName: string;
  readonly studentInitials: string;
  readonly courseName: string;
  readonly courseCode: string;
  readonly sectionCode: string;
  readonly programCode: string;
  readonly programName: string;
  readonly enrolledAt: string;
  readonly status: EnrollmentStatus;
}

export interface ActiveSectionSummary {
  readonly id: string;
  readonly code: string;
  readonly courseCode: string;
  readonly courseName: string;
  readonly teacherName: string;
  readonly schedule: string;
  readonly classroom: string;
  readonly enrolledCount: number;
  readonly capacity: number;
}

export interface DashboardAlertItem {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly timeLabel: string;
  readonly tone: 'info' | 'warning' | 'success';
}

export interface DashboardSummary {
  readonly metrics: {
    readonly activeStudents: number;
    readonly activeTeachers: number;
    readonly programsCount: number;
    readonly coursesCount: number;
    readonly sectionsCount: number;
    readonly activeEnrollments: number;
  };
  readonly currentPeriod: AcademicPeriodItem | null;
  readonly recentUsers: ReadonlyArray<{
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly role: UserRole;
    readonly isActive: boolean;
    readonly createdAt: string;
  }>;
  readonly programDistribution: readonly ProgramDistributionItem[];
  readonly monthlyGrowth: readonly MonthlyGrowthPoint[];
  readonly recentEnrollments: readonly RecentEnrollmentSummary[];
  readonly activeSections: readonly ActiveSectionSummary[];
  readonly alerts: readonly DashboardAlertItem[];
}

export interface CreateUserPayload {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly documentNumber?: string;
  readonly phone?: string;
  readonly role: UserRole;
  readonly programId?: string;
  readonly currentCycle?: number;
  readonly specialty?: string;
}

export interface CreateProgramPayload {
  readonly code: string;
  readonly name: string;
  readonly durationCycles: number;
}

export interface CreatePeriodPayload {
  readonly code: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly isCurrent: boolean;
}

export interface CreateCoursePayload {
  readonly code: string;
  readonly name: string;
  readonly credits: number;
  readonly cycleNumber: number;
  readonly programId: string;
}

export interface CreateSectionPayload {
  readonly code: string;
  readonly courseId: string;
  readonly periodId: string;
  readonly teacherId: string;
  readonly schedule: string;
  readonly classroom: string;
  readonly capacity: number;
}

export interface CreateEnrollmentPayload {
  readonly studentId: string;
  readonly sectionId: string;
}
