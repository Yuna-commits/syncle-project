import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FormInput from '../../components/common/FormInput'
import FormButton from '../../components/common/FormButton'
import { GoogleLogin } from '@react-oauth/google'
import { useAuthMutations } from '../../hooks/auth/useAuthMutations'
import { useForm } from 'react-hook-form'

export default function SignInPage() {
  const location = useLocation() // 위치 훅
  const from = location.state?.from || '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const [isKeepLogin, setIsKeepLogin] = useState(false)
  const { login, googleLogin, isLoginPending } = useAuthMutations()

  const onSubmit = (data) => {
    // data: {email, password}
    login(
      { ...data, isKeepLogin, redirectTo: from },
      {
        onError: (error) => {
          // 비밀번호 필드 아래에 에러 메시지 표시
          setError('password', {
            type: 'manual',
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
          })
          // 이메일 필드는 빨간불
          setError('email', { type: 'manual', message: '' })
        },
      },
    )
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800">로그인</h1>
        <p className="text-sm text-gray-500">
          이메일과 비밀번호를 입력해 계정에 로그인하세요.
        </p>
      </div>

      {/* Google로 로그인하기 */}
      <GoogleLogin
        onSuccess={(credentialResponse) =>
          googleLogin({
            token: credentialResponse.credential,
            redirectTo: from,
          })
        }
        onError={() => {
          alert('로그인에 실패했습니다.')
        }}
        theme="outline"
        shape="rectangular"
        size="large"
        width={380}
        text="Google로 로그인하기"
      />

      {/* 구분선 */}
      <div className="relative py-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 이메일 */}
        <FormInput
          name="email"
          type="email"
          label="이메일"
          placeholder="이메일을 입력해 주세요."
          {...register('email', {
            required: '이메일을 입력해주세요.',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: '올바른 이메일 형식이 아닙니다.',
            },
          })}
          error={errors.email?.message}
        />
        {/* 비밀번호 */}
        <FormInput
          name="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요."
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
          })}
          error={errors.password?.message}
        />

        {/* 로그인 상태 유지 / 비밀번호 찾기 */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isKeepLogin}
              onChange={(e) => setIsKeepLogin(e.target.checked)}
              className="h-5 w-5 rounded-md border border-gray-300 checked:border-transparent checked:bg-blue-500"
            />
            <span className="text-sm text-gray-700">로그인 상태 유지</span>
          </label>
          <Link
            to="/auth/reset-password"
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        {/* 폼 제출 */}
        <FormButton type="submit" text="로그인" isLoading={isLoginPending} />
      </form>

      {/* 회원가입 링크 */}
      <p className="mt-5 text-left text-sm text-gray-700">
        아직 계정이 없으신가요?{' '}
        <Link
          to="/auth/signup"
          className="font-semibold text-blue-500 hover:text-blue-600"
        >
          회원가입하러 가기
        </Link>
      </p>
    </>
  )
}
