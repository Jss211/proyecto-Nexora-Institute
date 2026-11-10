import type { AdminUserItem } from '../../types/admin.types';

/**
 * Computes initials from a user's first and last name.
 */
export function getStudentInitials(user: AdminUserItem): string {
  const first = user.firstName.trim().charAt(0).toUpperCase();
  const last = user.lastName.trim().charAt(0).toUpperCase();
  return `${first}${last}` || 'AL';
}

/**
 * Computes the student's weighted average score across recorded grades (0-20 scale), or null if none exist.
 */
export function getStudentAverageScore(user: AdminUserItem): number | null {
  const enrollments = user.studentProfile?.enrollments ?? [];
  const courseAverages: number[] = [];

  for (const enrollment of enrollments) {
    if (enrollment.grades.length === 0) continue;

    const totalWeight = enrollment.grades.reduce((acc, g) => acc + g.weight, 0);
    if (totalWeight > 0) {
      const weighted = enrollment.grades.reduce(
        (acc, g) => acc + g.score * g.weight,
        0,
      );
      courseAverages.push(weighted / totalWeight);
    } else {
      const simple =
        enrollment.grades.reduce((acc, g) => acc + g.score, 0) /
        enrollment.grades.length;
      courseAverages.push(simple);
    }
  }

  if (courseAverages.length === 0) return null;
  const avg =
    courseAverages.reduce((acc, val) => acc + val, 0) / courseAverages.length;
  return Number(avg.toFixed(1));
}
