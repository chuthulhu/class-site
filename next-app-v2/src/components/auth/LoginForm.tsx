'use client'

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { authenticate } from '@/app/actions/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AuthState } from '@/app/actions/auth';

const initialState: AuthState = {
  success: false,
  error: '',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium ${
        pending ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {pending ? '인증 중...' : '로그인'}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(authenticate, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      // In a real app, you'd set a cookie or session here.
      // For this migration, we'll just redirect to dashboard (to be implemented).
      // For now, let's just show an alert or redirect to root.
      // Since we don't have a dashboard yet, I'll redirect to /
      // But wait, the original app just showed the portal.
      // I'll assume we will have a dashboard page.
      router.push('/dashboard'); 
    }
  }, [state.success, router]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-gray-800">교사 관리 포털</h1>
        <p className="text-gray-600 mt-2">관리자 인증이 필요합니다</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            관리자 암호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="암호를 입력하세요"
            required
          />
        </div>
        <SubmitButton />
      </form>
      {state.error && (
        <div className="mt-4 text-red-600 text-sm text-center">
          {state.error}
        </div>
      )}
    </div>
  );
}
