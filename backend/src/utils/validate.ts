import { ZodType, ZodTypeDef } from 'zod';
import { AppError } from '../middlewares/errorHandler';

/**
 * Parses and validates arbitrary input against a Zod schema, throwing a 400 AppError on failure.
 */
export function parseWithSchema<TOutput>(
  schema: ZodType<TOutput, ZodTypeDef, unknown>,
  input: unknown,
): TOutput {
  const result = schema.safeParse(input);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join('.') || 'datos'}: ${firstIssue.message}`
      : 'Datos de entrada inválidos';
    throw new AppError(message, 400);
  }
  return result.data;
}
