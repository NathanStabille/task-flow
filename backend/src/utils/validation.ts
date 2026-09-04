import { HttpError } from './http-error.js';

export function parseId(value: unknown): number {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new HttpError(400, 'O identificador informado é inválido.');
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'O identificador informado é inválido.');
  }

  return id;
}

export function requiredText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `O campo ${fieldName} é obrigatório.`);
  }

  return value.trim();
}

export function emailValue(value: unknown): string {
  const email = requiredText(value, 'email').toLocaleLowerCase('pt-BR');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new HttpError(400, 'Informe um email válido.');
  }

  return email;
}

export function passwordValue(value: unknown): string {
  const password = requiredText(value, 'password');

  if (password.length < 8) {
    throw new HttpError(400, 'A senha deve ter pelo menos 8 caracteres.');
  }

  return password;
}

export function optionalText(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Foi informado um texto inválido.');
  }

  return value.trim();
}

export function enumValue<T extends string>(
  value: unknown,
  options: readonly T[],
  fieldName: string,
): T {
  if (typeof value !== 'string' || !options.includes(value as T)) {
    throw new HttpError(
      400,
      `O campo ${fieldName} deve ser um destes valores: ${options.join(', ')}.`,
    );
  }

  return value as T;
}

export function optionalEntityId(value: unknown, fieldName: string): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `O campo ${fieldName} é inválido.`);
  }

  return id;
}

export function optionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'O prazo informado é inválido.');
  }

  return date;
}
