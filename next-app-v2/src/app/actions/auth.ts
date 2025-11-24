'use server'

import { z } from 'zod';

const schema = z.object({
  password: z.string().min(1, '암호를 입력해주세요'),
});

export type AuthState = {
  success: false;
  error?: string;
  message?: string;
} | {
  success: true;
  message: string;
  error?: string;
};

export async function authenticate(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password');

  const validatedFields = schema.safeParse({
    password,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.password?.[0] || '잘못된 입력입니다.',
    };
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'teacher2024';

  if (validatedFields.data.password.trim() === adminPassword.trim()) {
    return {
      success: true,
      message: '인증 성공',
    };
  } else {
    return {
      success: false,
      error: '잘못된 암호입니다',
    };
  }
}
