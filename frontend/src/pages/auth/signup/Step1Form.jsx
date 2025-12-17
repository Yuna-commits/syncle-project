import React from 'react'
import FormInput from '../../../components/common/FormInput'
import FormButton from '../../../components/common/FormButton'
import useSignUpStore from '../../../stores/auth/useSignUpStore'
import { useAuthMutations } from '../../../hooks/auth/useAuthMutations'
import { useForm } from 'react-hook-form'

export default function Step1Form() {
  const {
    register,
    handleSubmit,
    trigger, // 수동 유효성 검사용
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      nickname: '',
      password: '',
    },
  })

  // UI 상태
  const {
    setEmail,
    successes, // 성공 메시지
    setSuccesses,
    errors: storeErrors, // 서버 에러 메시지
  } = useSignUpStore()

  const { checkEmail, checkNickname, requestSignupCode, isSignupPending } =
    useAuthMutations()

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    // 이메일 필드만 유효성 검사
    const isFormValid = await trigger('email')
    if (isFormValid) {
      const email = getValues('email')
      checkEmail(email) // API 호출
    }
  }

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    // 닉네임 필드만 유효성 검사
    const isFormValid = await trigger('nickname')
    if (isFormValid) {
      const nickname = getValues('nickname')
      checkNickname(nickname) // API 호출
    }
  }

  // 다음 단계로 이동 (폼 제출)
  const onSubmit = (data) => {
    // 중복 확인을 통과했는지 검증
    if (!successes.email || !successes.nickname) {
      alert('이메일과 닉네임 중복 확인을 완료해주세요.')
      return
    }
    // Step2에서 사용
    setEmail(data.email)
    requestSignupCode(data)
  }

  // 중복 확인 여부 체크
  // 폼 유효성 만족 && 이메일 중복 확인 && 닉네임 중복 확인
  const isAllVerified = isValid && successes.email && successes.nickname

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 닉네임 */}
      <div className="space-y-1">
        <div className="flex items-end gap-2">
          <div className="grow">
            <FormInput
              label="닉네임"
              placeholder="2~10자 이내의 한글/영문/숫자"
              error={errors.nickname?.message || storeErrors.nickname}
              success={successes.nickname}
              {...register('nickname', {
                required: '닉네임을 입력해주세요.',
                minLength: {
                  value: 2,
                  message: '2글자 이상 입력해주세요.',
                },
                maxLength: {
                  value: 10,
                  message: '10글자 이하로 입력해주세요.',
                },
                pattern: {
                  value: /^[a-zA-Z0-9가-힣]+$/,
                  message: '특수문자는 사용할 수 없습니다.',
                },
                // 값이 변하면 인증 상태 초기화
                onChange: () => setSuccesses({ ...successes, nickname: '' }),
              })}
            >
              {/* 중복 확인 버튼 */}
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!!errors.nickname || !getValues('nickname')} // 에러가 있거나 비어있으면 비활성
                className={`absolute top-1/2 right-2 h-8 -translate-y-1/2 rounded border border-gray-200 bg-white px-3 text-xs font-medium transition-colors hover:cursor-pointer ${
                  successes.nickname
                    ? 'cursor-default text-blue-600' // 인증 완료 시 스타일
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {successes.nickname ? '확인 완료' : '중복 확인'}
              </button>
            </FormInput>
          </div>
        </div>
      </div>

      {/* 이메일 */}
      <div className="space-y-1">
        <div className="flex items-end gap-2">
          <div className="grow">
            <FormInput
              label="이메일"
              type="email"
              placeholder="example@email.com"
              error={errors.email?.message || storeErrors.email}
              success={successes.email}
              // api 호출 전에 미리 유효성 검증
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '이메일 형식이 올바르지 않습니다.',
                },
                // 값이 변하면 인증 상태 초기화
                onChange: () => setSuccesses({ ...successes, email: '' }),
              })}
            >
              {/* 중복 확인 버튼 */}
              <button
                type="button"
                onClick={handleCheckEmail}
                disabled={!!errors.email || !getValues('email')} // 에러가 있거나 비어있으면 비활성
                className={`absolute top-1/2 right-2 h-8 -translate-y-1/2 rounded border border-gray-200 bg-white px-3 text-xs font-medium transition-colors hover:cursor-pointer ${
                  successes.email
                    ? 'cursor-default text-blue-600' // 인증 완료 시 스타일
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {successes.email ? '확인 완료' : '중복 확인'}
              </button>
            </FormInput>
          </div>
        </div>
      </div>

      {/* 비밀번호 */}
      <FormInput
        label="비밀번호"
        type="password"
        placeholder="영문, 숫자 포함 8자 이상"
        error={errors.password?.message}
        {...register('password', {
          required: '비밀번호를 입력해주세요.',
          minLength: {
            value: 8,
            message: '8자 이상 입력해주세요.',
          },
          pattern: {
            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
            message: '영문과 숫자를 포함해야 합니다.',
          },
        })}
      />

      {/* 폼 제출 */}
      <FormButton
        type="submit"
        text={`${isSignupPending ? '전송 중...' : '인증번호 받기'}`}
        // 모든 검증이 끝나야 활성화
        disabled={!isAllVerified}
        isLoading={isSignupPending}
      />
    </form>
  )
}
