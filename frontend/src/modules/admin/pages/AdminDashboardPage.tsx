import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BrandLogo } from '../../../components/ui/BrandLogo';
import { useAuth } from '../../../context/AuthContext';
import { AdminAcademicTab } from '../components/AdminAcademicTab';
import { AdminSectionsTab } from '../components/AdminSectionsTab';
import { AdminUsersTab } from '../components/AdminUsersTab';
import { AdminOverviewView } from '../components/overview/AdminOverviewView';
import { AdminStudentsView } from '../components/students/AdminStudentsView';
import { adminService } from '../services/adminService';
import type {
  AcademicPeriodItem,
  AdminSectionKey,
  AdminUserItem,
  CourseItem,
  DashboardSummary,
  EnrollmentItem,
  ProgramItem,
  SectionItem,
} from '../types/admin.types';

interface SidebarNavItem {
  readonly key: AdminSectionKey;
  readonly label: string;
  readonly subtitle: string;
  readonly icon: typeof LayoutDashboard;
  readonly badgeCount?: number;
}

interface SidebarGroup {
  readonly id: string;
  readonly heading: string;
  readonly collapsible: boolean;
  readonly items: readonly SidebarNavItem[];
}

const SECTION_GROUP_MAP: Record<AdminSectionKey, string> = {
  overview: 'principal',
  students: 'academic',
  teachers: 'academic',
  programs: 'academic',
  courses: 'academic',
  periods: 'academic',
  enrollments: 'management',
  sections: 'management',
  grades: 'management',
  attendance: 'management',
  users: 'system',
  reports: 'system',
};

const PENDING_MODULE_META: Partial<
  Record<
    AdminSectionKey,
    { readonly title: string; readonly description: string; readonly milestone: string }
  >
> = {
  grades: {
    title: 'Módulo de Calificaciones',
    description:
      'Consolidado de actas, notas parciales y promedios por sección y estudiante.',
    milestone: 'Disponible en el Módulo 4 (Docente + Admin)',
  },
  attendance: {
    title: 'Módulo de Asistencia',
    description:
      'Registro histórico de asistencias, tardanzas y porcentajes mínimos por curso.',
    milestone: 'Disponible en el Módulo 4 (Docente + Admin)',
  },
  reports: {
    title: 'Reportes Académicos',
    description:
      'Exportación consolidada de matrículas, rendimiento y ocupación de secciones.',
    milestone: 'Disponible en el Módulo 5',
  },
};

/**
 * Main Administrator workspace shell with collapsible accordion navigation and modular views.
 */
export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] =
    useState<AdminSectionKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    principal: true,
    academic: true,
    management: true,
    system: false,
  });

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriodItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [teachers, setTeachers] = useState<AdminUserItem[]>([]);
  const [students, setStudents] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAdminWorkspace = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [
        summaryData,
        programsData,
        periodsData,
        coursesData,
        sectionsData,
        enrollmentsData,
        teachersData,
        studentsData,
      ] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.listPrograms(),
        adminService.listPeriods(),
        adminService.listCourses(),
        adminService.listSections(),
        adminService.listEnrollments(),
        adminService.listUsers('TEACHER'),
        adminService.listUsers('STUDENT'),
      ]);

      setSummary(summaryData);
      setPrograms(programsData);
      setPeriods(periodsData);
      setCourses(coursesData);
      setSections(sectionsData);
      setEnrollments(enrollmentsData);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el panel administrativo',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminWorkspace();
  }, [loadAdminWorkspace]);

  const metrics = summary?.metrics;

  const sidebarGroups: readonly SidebarGroup[] = [
    {
      id: 'principal',
      heading: 'PRINCIPAL',
      collapsible: false,
      items: [
        {
          key: 'overview',
          label: 'Dashboard',
          subtitle: 'Resumen ejecutivo y analítica del instituto',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      id: 'academic',
      heading: 'ACADÉMICO',
      collapsible: true,
      items: [
        {
          key: 'students',
          label: 'Estudiantes',
          subtitle: 'Directorio, códigos y ciclo de alumnos',
          icon: Users,
          badgeCount: metrics?.activeStudents,
        },
        {
          key: 'teachers',
          label: 'Docentes',
          subtitle: 'Plana docente y especialidades',
          icon: GraduationCap,
          badgeCount: metrics?.activeTeachers,
        },
        {
          key: 'programs',
          label: 'Carreras',
          subtitle: 'Programas profesionales del instituto',
          icon: Building2,
          badgeCount: metrics?.programsCount,
        },
        {
          key: 'courses',
          label: 'Cursos',
          subtitle: 'Malla curricular y créditos por ciclo',
          icon: BookOpen,
          badgeCount: metrics?.coursesCount,
        },
        {
          key: 'periods',
          label: 'Periodos',
          subtitle: 'Ciclos académicos y vigencia',
          icon: CalendarDays,
        },
      ],
    },
    {
      id: 'management',
      heading: 'GESTIÓN',
      collapsible: true,
      items: [
        {
          key: 'enrollments',
          label: 'Matrículas',
          subtitle: 'Inscripciones y estado académico',
          icon: ClipboardList,
          badgeCount: metrics?.activeEnrollments,
        },
        {
          key: 'sections',
          label: 'Horarios y Secciones',
          subtitle: 'Asignación docente, aulas y horarios',
          icon: CalendarRange,
          badgeCount: metrics?.sectionsCount,
        },
        {
          key: 'grades',
          label: 'Calificaciones',
          subtitle: 'Control de actas y evaluaciones',
          icon: Award,
        },
        {
          key: 'attendance',
          label: 'Asistencia',
          subtitle: 'Seguimiento de asistencia por sección',
          icon: CheckSquare,
        },
      ],
    },
    {
      id: 'system',
      heading: 'SISTEMA',
      collapsible: true,
      items: [
        {
          key: 'users',
          label: 'Control de Accesos',
          subtitle: 'Administración general de cuentas',
          icon: ShieldCheck,
        },
        {
          key: 'reports',
          label: 'Reportes',
          subtitle: 'Consolidado institucional y descargas',
          icon: BarChart3,
        },
      ],
    },
  ];

  const allItems = sidebarGroups.flatMap((group) => group.items);
  const activeMeta =
    allItems.find((item) => item.key === activeSection) ?? allItems[0];

  function toggleGroup(groupId: string): void {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }

  function handleSelectSection(section: AdminSectionKey): void {
    setActiveSection(section);
    const targetGroup = SECTION_GROUP_MAP[section];
    setOpenGroups((prev) => ({ ...prev, [targetGroup]: true }));
    setMobileMenuOpen(false);
  }

  const pendingMeta = PENDING_MODULE_META[activeSection];

  return (
    <div className="flex min-h-screen bg-[#02040a] text-white">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/75 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar with collapsible Accordion sections */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-blue-950/90 bg-[#040812] p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto pr-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            <BrandLogo compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 space-y-4" aria-label="Navegación administrativa">
            {sidebarGroups.map((group) => {
              const isOpen = openGroups[group.id] ?? true;

              return (
                <div key={group.id}>
                  {group.collapsible ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-slate-300"
                    >
                      <span>{group.heading}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${
                          isOpen ? 'rotate-0 text-blue-400' : '-rotate-90 text-slate-600'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {group.heading}
                    </p>
                  )}

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? 'mt-1.5 grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeSection === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleSelectSection(item.key)}
                              className={`relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                                isActive
                                  ? 'border border-blue-500/45 bg-gradient-to-r from-blue-950/90 to-blue-900/35 text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.55)]'
                                  : 'border border-transparent text-slate-400 hover:bg-blue-950/30 hover:text-white'
                              }`}
                            >
                              {isActive && (
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-blue-500"
                                />
                              )}
                              <span className="flex items-center gap-3 truncate">
                                <Icon
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive
                                      ? 'text-blue-400'
                                      : 'text-slate-500'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{item.label}</span>
                              </span>

                              {typeof item.badgeCount === 'number' && (
                                <span
                                  className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    isActive
                                      ? 'bg-blue-600/30 text-blue-200'
                                      : 'bg-white/5 text-slate-400'
                                  }`}
                                >
                                  {item.badgeCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-950/80 bg-[#060c18] p-4">
          <p className="text-xs font-semibold text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-900/70 bg-blue-950/40 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-blue-950/80 bg-[#02040a]/85 px-5 py-3.5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-blue-950 p-2 text-slate-300 hover:border-blue-600 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                {activeMeta.label}
              </h1>
              <p className="text-xs text-slate-400">{activeMeta.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadAdminWorkspace()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-950 bg-[#060c18] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-blue-600 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`}
              aria-hidden="true"
            />
            Actualizar
          </button>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          {loadError && (
            <div className="mb-6 rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {loadError}
            </div>
          )}

          {activeSection === 'overview' && (
            <AdminOverviewView
              adminFirstName={user?.firstName ?? 'Admin'}
              summary={summary}
              students={students}
              sections={sections}
              isLoading={isLoading}
              onNavigate={handleSelectSection}
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'students' && (
            <AdminStudentsView
              programs={programs}
              currentPeriod={summary?.currentPeriod ?? null}
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'teachers' && (
            <AdminUsersTab
              programs={programs}
              currentUserId={user?.id ?? ''}
              fixedRole="TEACHER"
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'users' && (
            <AdminUsersTab
              programs={programs}
              currentUserId={user?.id ?? ''}
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'programs' && (
            <AdminAcademicTab
              programs={programs}
              periods={periods}
              courses={courses}
              focusSection="programs"
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'courses' && (
            <AdminAcademicTab
              programs={programs}
              periods={periods}
              courses={courses}
              focusSection="courses"
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'periods' && (
            <AdminAcademicTab
              programs={programs}
              periods={periods}
              courses={courses}
              focusSection="periods"
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'enrollments' && (
            <AdminSectionsTab
              sections={sections}
              enrollments={enrollments}
              courses={courses}
              periods={periods}
              teachers={teachers}
              students={students}
              focusSection="enrollments"
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {activeSection === 'sections' && (
            <AdminSectionsTab
              sections={sections}
              enrollments={enrollments}
              courses={courses}
              periods={periods}
              teachers={teachers}
              students={students}
              focusSection="sections"
              onDataChanged={() => void loadAdminWorkspace()}
            />
          )}

          {pendingMeta && (
            <div className="mx-auto max-w-xl rounded-2xl border border-blue-950/90 bg-[#060c18]/95 p-8 text-center animate-scale-in">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                {pendingMeta.milestone}
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {pendingMeta.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {pendingMeta.description}
              </p>
              <button
                type="button"
                onClick={() => handleSelectSection('overview')}
                className="mt-6 rounded-xl border border-blue-800/80 bg-blue-950/60 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-blue-500"
              >
                Volver al Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
