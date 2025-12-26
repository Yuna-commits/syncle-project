import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { sendInquiry } from '../../api/support.api'
import { useToast } from '../../hooks/useToast'
import FormInput from '../../components/common/FormInput'
import FormButton from '../../components/common/FormButton'

const INQUIRY_TYPES = [
  { value: 'ACCOUNT', label: '계정 관련' },
  { value: 'BUG', label: '버그 신고' },
  { value: 'USAGE', label: '이용 문의' },
  { value: 'OTHER', label: '기타' },
]

const SupportPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    type: 'ACCOUNT',
    title: '',
    content: '',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: sendInquiry.sendInquiry,
    onSuccess: () => {
      showToast('문의가 성공적으로 발송되었습니다.', 'success')
      navigate('/') // 전송 후 홈으로 이동
    },
    onError: () => {
      showToast('문의 발송에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('제목과 내용을 모두 입력해주세요.', 'warning')
      return
    }
    if (window.confirm('작성하신 내용으로 문의를 보내시겠습니까?')) {
      mutate(formData)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">문의하기</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 문의 유형 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              문의 유형
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="focus:ring-primary-500 w-full rounded-md border border-gray-300 bg-white p-2 focus:ring-2 focus:outline-none"
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <FormInput
            label="제목"
            name="title"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={handleChange}
          />

          {/* 내용 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              문의 내용
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="focus:ring-primary-500 h-64 w-full resize-none rounded-md border border-gray-300 p-3 focus:ring-2 focus:outline-none"
              placeholder="문의하실 내용을 자세히 적어주세요."
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              취소
            </button>
            <div className="w-32">
              <FormButton
                text={isPending ? '전송 중...' : '문의하기'}
                disabled={isPending}
                type="submit"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupportPage
