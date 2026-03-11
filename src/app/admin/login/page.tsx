'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsMissing: '이메일과 비밀번호를 입력하세요',
  InvalidCredentials: '유효하지 않은 이메일 또는 비밀번호',
  UserNotFound: '등록되지 않은 사용자입니다',
  InvalidPassword: '비밀번호가 일치하지 않습니다',
  RateLimitExceeded: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const urlError = searchParams.get('error');
  const [error, setError] = useState<string | null>(
    urlError ? (ERROR_MESSAGES[urlError] ?? '로그인 중 오류가 발생했습니다') : null
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard/home';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(ERROR_MESSAGES[result.error] ?? '로그인 중 오류가 발생했습니다');
      setIsLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            숙명여자대학교
          </h1>
          <p className="text-blue-100 text-lg">시각영상디자인과 관리자</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">관리자 로그인</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smvd.ac.kr"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex gap-3">
                <span className="text-lg">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>© 2026 Sookmyung Women's University</p>
          <p>Visual & Media Design Department</p>
        </div>
      </div>
    </div>
  );
}
