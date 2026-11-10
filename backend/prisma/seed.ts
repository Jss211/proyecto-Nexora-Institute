import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const defaultAdminHash = await bcrypt.hash('Admin123!', 10);
  const defaultTeacherHash = await bcrypt.hash('Docente123!', 10);
  const defaultStudentHash = await bcrypt.hash('Alumno123!', 10);

  const softwareProgram = await prisma.program.upsert({
    where: { code: 'ISW' },
    update: {},
    create: {
      code: 'ISW',
      name: 'Desarrollo de Software',
      durationCycles: 6,
    },
  });

  const designProgram = await prisma.program.upsert({
    where: { code: 'DSD' },
    update: {},
    create: {
      code: 'DSD',
      name: 'Diseño Digital y UX',
      durationCycles: 6,
    },
  });

  const period2026 = await prisma.academicPeriod.upsert({
    where: { code: '2026-I' },
    update: { isCurrent: true },
    create: {
      code: '2026-I',
      name: 'Ciclo Académico 2026-I',
      startDate: new Date('2026-03-02T00:00:00.000Z'),
      endDate: new Date('2026-07-18T00:00:00.000Z'),
      isCurrent: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@nexorainstitute.edu' },
    update: {},
    create: {
      email: 'admin@nexorainstitute.edu',
      passwordHash: defaultAdminHash,
      firstName: 'Carlos',
      lastName: 'Mendoza',
      documentNumber: '70112233',
      phone: '999111222',
      role: UserRole.ADMIN,
    },
  });

  const teacherOneUser = await prisma.user.upsert({
    where: { email: 'docente@nexorainstitute.edu' },
    update: {},
    create: {
      email: 'docente@nexorainstitute.edu',
      passwordHash: defaultTeacherHash,
      firstName: 'Laura',
      lastName: 'Paredes',
      documentNumber: '70445566',
      phone: '988333444',
      role: UserRole.TEACHER,
    },
  });

  const teacherOneProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacherOneUser.id },
    update: {},
    create: {
      userId: teacherOneUser.id,
      teacherCode: 'DOC-2026-001',
      specialty: 'Arquitectura Web y TypeScript',
    },
  });

  const teacherTwoUser = await prisma.user.upsert({
    where: { email: 'j.ramirez@nexorainstitute.edu' },
    update: {},
    create: {
      email: 'j.ramirez@nexorainstitute.edu',
      passwordHash: defaultTeacherHash,
      firstName: 'Jorge',
      lastName: 'Ramírez',
      documentNumber: '70556677',
      phone: '987654321',
      role: UserRole.TEACHER,
    },
  });

  const teacherTwoProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacherTwoUser.id },
    update: {},
    create: {
      userId: teacherTwoUser.id,
      teacherCode: 'DOC-2026-002',
      specialty: 'Bases de Datos PostgreSQL y Cloud',
    },
  });

  const studentOneUser = await prisma.user.upsert({
    where: { email: 'estudiante@nexorainstitute.edu' },
    update: {},
    create: {
      email: 'estudiante@nexorainstitute.edu',
      passwordHash: defaultStudentHash,
      firstName: 'Diego',
      lastName: 'Torres',
      documentNumber: '74889900',
      phone: '977888999',
      role: UserRole.STUDENT,
    },
  });

  const studentOneProfile = await prisma.studentProfile.upsert({
    where: { userId: studentOneUser.id },
    update: {},
    create: {
      userId: studentOneUser.id,
      studentCode: 'NX-2026-0001',
      programId: softwareProgram.id,
      currentCycle: 2,
    },
  });

  const studentTwoUser = await prisma.user.upsert({
    where: { email: 'ana.silva@nexorainstitute.edu' },
    update: {},
    create: {
      email: 'ana.silva@nexorainstitute.edu',
      passwordHash: defaultStudentHash,
      firstName: 'Ana',
      lastName: 'Silva',
      documentNumber: '74990011',
      phone: '966555444',
      role: UserRole.STUDENT,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentTwoUser.id },
    update: {},
    create: {
      userId: studentTwoUser.id,
      studentCode: 'NX-2026-0002',
      programId: designProgram.id,
      currentCycle: 1,
    },
  });

  const courseWeb = await prisma.course.upsert({
    where: { code: 'SW-201' },
    update: {},
    create: {
      code: 'SW-201',
      name: 'Desarrollo Web Full Stack',
      credits: 4,
      cycleNumber: 2,
      programId: softwareProgram.id,
    },
  });

  const courseDb = await prisma.course.upsert({
    where: { code: 'BD-202' },
    update: {},
    create: {
      code: 'BD-202',
      name: 'Administración de PostgreSQL',
      credits: 4,
      cycleNumber: 2,
      programId: softwareProgram.id,
    },
  });

  await prisma.course.upsert({
    where: { code: 'SW-101' },
    update: {},
    create: {
      code: 'SW-101',
      name: 'Algoritmos y Estructura de Datos',
      credits: 5,
      cycleNumber: 1,
      programId: softwareProgram.id,
    },
  });

  const sectionWeb = await prisma.section.upsert({
    where: {
      courseId_periodId_code: {
        courseId: courseWeb.id,
        periodId: period2026.id,
        code: 'A',
      },
    },
    update: {},
    create: {
      code: 'A',
      courseId: courseWeb.id,
      periodId: period2026.id,
      teacherId: teacherOneProfile.id,
      schedule: 'Lun y Mié 18:30 - 20:30',
      classroom: 'Lab 204',
      capacity: 30,
    },
  });

  const sectionDb = await prisma.section.upsert({
    where: {
      courseId_periodId_code: {
        courseId: courseDb.id,
        periodId: period2026.id,
        code: 'A',
      },
    },
    update: {},
    create: {
      code: 'A',
      courseId: courseDb.id,
      periodId: period2026.id,
      teacherId: teacherTwoProfile.id,
      schedule: 'Mar y Jue 19:00 - 21:00',
      classroom: 'Lab 102',
      capacity: 28,
    },
  });

  const enrollmentWeb = await prisma.enrollment.upsert({
    where: {
      studentId_sectionId: {
        studentId: studentOneProfile.id,
        sectionId: sectionWeb.id,
      },
    },
    update: {},
    create: {
      studentId: studentOneProfile.id,
      sectionId: sectionWeb.id,
    },
  });

  const existingGradesCount = await prisma.grade.count({
    where: { enrollmentId: enrollmentWeb.id },
  });

  if (existingGradesCount === 0) {
    await prisma.grade.createMany({
      data: [
        {
          enrollmentId: enrollmentWeb.id,
          title: 'Evaluación Continua 1',
          weight: 0.4,
          score: 17.5,
        },
        {
          enrollmentId: enrollmentWeb.id,
          title: 'Examen Parcial',
          weight: 0.6,
          score: 18.0,
        },
      ],
    });
  }

  await prisma.enrollment.upsert({
    where: {
      studentId_sectionId: {
        studentId: studentOneProfile.id,
        sectionId: sectionDb.id,
      },
    },
    update: {},
    create: {
      studentId: studentOneProfile.id,
      sectionId: sectionDb.id,
    },
  });

  console.log('[Seed] Datos iniciales de Nexora Institute cargados correctamente.');
}

main()
  .catch((error) => {
    console.error('[Seed] Error cargando datos iniciales:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
