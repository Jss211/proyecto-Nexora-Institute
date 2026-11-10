import { EnrollmentStatus, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import type {
  CreateCourseInput,
  CreatePeriodInput,
  CreateProgramInput,
  CreateSectionInput,
} from './academic.schema';

const MONTH_SHORT_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
] as const;

interface DashboardAlert {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly timeLabel: string;
  readonly tone: 'info' | 'warning' | 'success';
}

function buildMonthlySeries(
  studentDates: ReadonlyArray<Date>,
  enrollmentDates: ReadonlyArray<Date>,
) {
  const now = new Date();
  const series: Array<{
    readonly label: string;
    readonly students: number;
    readonly enrollments: number;
  }> = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - offset + 1,
      0,
      23,
      59,
      59,
    );
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth() - offset,
      1,
      0,
      0,
      0,
    );

    const students = studentDates.filter((d) => d <= monthEnd).length;
    const enrollments = enrollmentDates.filter(
      (d) => d >= monthStart && d <= monthEnd,
    ).length;

    series.push({
      label: MONTH_SHORT_NAMES[monthStart.getMonth()],
      students,
      enrollments,
    });
  }

  return series;
}

/**
 * Aggregates high-level KPI metrics, chart datasets, and activity alerts for the Admin dashboard.
 */
export async function getDashboardSummary() {
  const [
    activeStudents,
    activeTeachers,
    inactiveUsersCount,
    programsCount,
    coursesCount,
    sectionsCount,
    activeEnrollments,
    currentPeriod,
    recentUsers,
    programRows,
    recentEnrollmentRows,
    sectionRows,
    studentUsers,
    enrollmentDates,
  ] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.STUDENT, isActive: true } }),
    prisma.user.count({ where: { role: UserRole.TEACHER, isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.program.count({ where: { isActive: true } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.section.count(),
    prisma.enrollment.count({ where: { status: EnrollmentStatus.ACTIVE } }),
    prisma.academicPeriod.findFirst({
      where: { isCurrent: true },
      orderBy: { startDate: 'desc' },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.program.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { students: true, courses: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.enrollment.findMany({
      take: 6,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        student: {
          select: {
            studentCode: true,
            user: { select: { firstName: true, lastName: true } },
            program: { select: { code: true, name: true } },
          },
        },
        section: {
          select: {
            code: true,
            course: { select: { code: true, name: true } },
          },
        },
      },
    }),
    prisma.section.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        schedule: true,
        classroom: true,
        capacity: true,
        course: { select: { code: true, name: true } },
        teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        _count: {
          select: { enrollments: { where: { status: EnrollmentStatus.ACTIVE } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: UserRole.STUDENT, isActive: true },
      select: { createdAt: true },
    }),
    prisma.enrollment.findMany({
      select: { enrolledAt: true },
    }),
  ]);

  const programDistribution = programRows.map((program) => ({
    id: program.id,
    code: program.code,
    name: program.name,
    studentCount: program._count.students,
    courseCount: program._count.courses,
  }));

  const recentEnrollments = recentEnrollmentRows.map((item) => {
    const firstInitial = item.student.user.firstName.charAt(0).toUpperCase();
    const lastInitial = item.student.user.lastName.charAt(0).toUpperCase();
    return {
      id: item.id,
      studentCode: item.student.studentCode,
      studentName: `${item.student.user.firstName} ${item.student.user.lastName}`,
      studentInitials: `${firstInitial}${lastInitial}`,
      courseName: item.section.course.name,
      courseCode: item.section.course.code,
      sectionCode: item.section.code,
      programCode: item.student.program.code,
      programName: item.student.program.name,
      enrolledAt: item.enrolledAt,
      status: item.status,
    };
  });

  const activeSections = sectionRows.map((section) => ({
    id: section.id,
    code: section.code,
    courseCode: section.course.code,
    courseName: section.course.name,
    teacherName: `${section.teacher.user.firstName} ${section.teacher.user.lastName}`,
    schedule: section.schedule,
    classroom: section.classroom,
    enrolledCount: section._count.enrollments,
    capacity: section.capacity,
  }));

  const alerts: DashboardAlert[] = [];

  if (currentPeriod) {
    alerts.push({
      id: `period-${currentPeriod.id}`,
      title: `Periodo activo: ${currentPeriod.name}`,
      detail: `${sectionsCount} secciones habilitadas en el ciclo ${currentPeriod.code}`,
      timeLabel: 'Vigente',
      tone: 'success',
    });
  } else {
    alerts.push({
      id: 'no-current-period',
      title: 'Sin periodo académico activo',
      detail: 'Marca un ciclo vigente desde la sección Periodos',
      timeLabel: 'Atención',
      tone: 'warning',
    });
  }

  for (const section of activeSections) {
    if (section.capacity > 0 && section.enrolledCount / section.capacity >= 0.8) {
      alerts.push({
        id: `cap-${section.id}`,
        title: `Cupos por completarse en ${section.courseCode} (${section.code})`,
        detail: `${section.enrolledCount} de ${section.capacity} cupos ocupados`,
        timeLabel: 'Capacidad',
        tone: 'warning',
      });
    }
  }

  if (recentUsers[0]) {
    alerts.push({
      id: `user-${recentUsers[0].id}`,
      title: `Último registro: ${recentUsers[0].firstName} ${recentUsers[0].lastName}`,
      detail: recentUsers[0].email,
      timeLabel: 'Reciente',
      tone: 'info',
    });
  }

  if (inactiveUsersCount > 0) {
    alerts.push({
      id: 'inactive-users',
      title: `${inactiveUsersCount} cuenta(s) desactivada(s)`,
      detail: 'Revisa el estado de acceso en el directorio de usuarios',
      timeLabel: 'Seguridad',
      tone: 'warning',
    });
  }

  return {
    metrics: {
      activeStudents,
      activeTeachers,
      programsCount,
      coursesCount,
      sectionsCount,
      activeEnrollments,
    },
    currentPeriod,
    recentUsers,
    programDistribution,
    monthlyGrowth: buildMonthlySeries(
      studentUsers.map((u) => u.createdAt),
      enrollmentDates.map((e) => e.enrolledAt),
    ),
    recentEnrollments,
    activeSections,
    alerts: alerts.slice(0, 5),
  };
}

export async function listPrograms() {
  return prisma.program.findMany({
    include: {
      _count: {
        select: { courses: true, students: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createProgram(input: CreateProgramInput) {
  return prisma.program.create({
    data: {
      code: input.code.toUpperCase(),
      name: input.name,
      durationCycles: input.durationCycles,
    },
    include: {
      _count: {
        select: { courses: true, students: true },
      },
    },
  });
}

export async function updateProgramStatus(id: string, isActive: boolean) {
  return prisma.program.update({
    where: { id },
    data: { isActive },
    include: {
      _count: {
        select: { courses: true, students: true },
      },
    },
  });
}

export async function listPeriods() {
  return prisma.academicPeriod.findMany({
    include: {
      _count: {
        select: { sections: true },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function createPeriod(input: CreatePeriodInput) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError('Las fechas del periodo no son válidas', 400);
  }
  if (endDate <= startDate) {
    throw new AppError(
      'La fecha de fin debe ser posterior a la fecha de inicio',
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    if (input.isCurrent) {
      await tx.academicPeriod.updateMany({ data: { isCurrent: false } });
    }

    return tx.academicPeriod.create({
      data: {
        code: input.code.toUpperCase(),
        name: input.name,
        startDate,
        endDate,
        isCurrent: input.isCurrent ?? false,
      },
      include: {
        _count: {
          select: { sections: true },
        },
      },
    });
  });
}

export async function setCurrentPeriod(periodId: string) {
  return prisma.$transaction(async (tx) => {
    const target = await tx.academicPeriod.findUnique({
      where: { id: periodId },
    });
    if (!target) {
      throw new AppError('Periodo académico no encontrado', 404);
    }

    await tx.academicPeriod.updateMany({ data: { isCurrent: false } });
    return tx.academicPeriod.update({
      where: { id: periodId },
      data: { isCurrent: true },
      include: {
        _count: {
          select: { sections: true },
        },
      },
    });
  });
}

export async function listCourses() {
  return prisma.course.findMany({
    include: {
      program: {
        select: { id: true, code: true, name: true },
      },
      _count: {
        select: { sections: true },
      },
    },
    orderBy: [{ program: { name: 'asc' } }, { cycleNumber: 'asc' }, { code: 'asc' }],
  });
}

export async function createCourse(input: CreateCourseInput) {
  const program = await prisma.program.findUnique({
    where: { id: input.programId },
  });
  if (!program) {
    throw new AppError('La carrera seleccionada no existe', 404);
  }

  return prisma.course.create({
    data: {
      code: input.code.toUpperCase(),
      name: input.name,
      credits: input.credits,
      cycleNumber: input.cycleNumber,
      programId: input.programId,
    },
    include: {
      program: {
        select: { id: true, code: true, name: true },
      },
      _count: {
        select: { sections: true },
      },
    },
  });
}

export async function listSections() {
  return prisma.section.findMany({
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          credits: true,
          program: { select: { code: true, name: true } },
        },
      },
      period: {
        select: { id: true, code: true, name: true, isCurrent: true },
      },
      teacher: {
        select: {
          id: true,
          teacherCode: true,
          specialty: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  });
}

export async function createSection(input: CreateSectionInput) {
  return prisma.section.create({
    data: {
      code: input.code.toUpperCase(),
      courseId: input.courseId,
      periodId: input.periodId,
      teacherId: input.teacherId,
      schedule: input.schedule,
      classroom: input.classroom,
      capacity: input.capacity,
    },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          credits: true,
          program: { select: { code: true, name: true } },
        },
      },
      period: {
        select: { id: true, code: true, name: true, isCurrent: true },
      },
      teacher: {
        select: {
          id: true,
          teacherCode: true,
          specialty: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });
}
