'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FormData, PerfumeItem, FavoriteInfo } from './types'
import ProductSection from './components/ProductSection'
import OrderSummary from './components/OrderSummary'
import FavoriteInfoSection from './components/FavoriteInfoSection'

export default function PerfumerOrderPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    xId: '',
    address: '',
    detailAddress: '',
    postalCode: '',
    quantity10ml: 0,
    perfumes10ml: [],
    quantity50ml: 0,
    perfumes50ml: [],
    additionalRequests: '',
    favoriteInfo: {
      name: '',
      type: '',
      personality: '',
      characteristics: '',
      mood: '',
      specialMemory: '',
      desiredVibe: '',
      favoriteReason: '',
      keywords: [],
      colors: [],
      images: []
    }
  })

  const [copySuccess, setCopySuccess] = useState(false)
  const calculateSubtotal = () => {
    return (formData.quantity10ml * 24000) + (formData.quantity50ml * 48000)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal >= 50000 ? 0 : 3500
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const updateQuantity = (type: '10ml' | '50ml', change: number) => {
    const currentQty = type === '10ml' ? formData.quantity10ml : formData.quantity50ml
    const newQty = Math.max(0, currentQty + change)
    
    if (type === '10ml') {
      const newPerfumes = Array.from({ length: newQty }, (_, index) => 
        formData.perfumes10ml[index] || {
          id: `10ml-${index}`,
          selectedScent: null,
          perfumeColor: '',
          perfumeIntensity: '연하게' as const,
          labelingNickname: ''
        }
      )
      setFormData(prev => ({
        ...prev,
        quantity10ml: newQty,
        perfumes10ml: newPerfumes
      }))
    } else {      const newPerfumes = Array.from({ length: newQty }, (_, index) => 
        formData.perfumes50ml[index] || {
          id: `50ml-${index}`,
          selectedScent: null,
          perfumeColor: '',
          perfumeIntensity: '연하게' as const,
          labelingNickname: ''
        }
      )
      setFormData(prev => ({
        ...prev,
        quantity50ml: newQty,
        perfumes50ml: newPerfumes
      }))
    }
  }

  const updatePerfumeItem = (type: '10ml' | '50ml', index: number, field: keyof PerfumeItem, value: any) => {
    if (type === '10ml') {
      setFormData(prev => ({
        ...prev,
        perfumes10ml: prev.perfumes10ml.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        perfumes50ml: prev.perfumes50ml.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }))
    }
  }

  const updateFavoriteInfo = (info: FavoriteInfo) => {
    setFormData(prev => ({
      ...prev,
      favoriteInfo: info
    }))
  }
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('1001-9326-0429')
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('계좌번호 복사 실패:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.quantity10ml === 0 && formData.quantity50ml === 0) {
      alert('최소 1개 이상의 향수를 주문해주세요!')
      return
    }

    // 최애 정보 검증
    if (!formData.favoriteInfo.name || !formData.favoriteInfo.type || 
        !formData.favoriteInfo.personality || !formData.favoriteInfo.characteristics ||
        !formData.favoriteInfo.desiredVibe) {
      alert('최애 정보를 모두 입력해주세요!')
      return
    }
    
    // 각 향수의 향료 선택 확인
    for (let i = 0; i < formData.quantity10ml; i++) {
      if (!formData.perfumes10ml[i]?.selectedScent) {
        alert(`10ml 향수 #${i + 1}의 향료를 선택해주세요!`)
        return
      }
      if (!formData.perfumes10ml[i]?.perfumeColor) {
        alert(`10ml 향수 #${i + 1}의 색상을 선택해주세요!`)
        return
      }
    }    
    for (let i = 0; i < formData.quantity50ml; i++) {
      if (!formData.perfumes50ml[i]?.selectedScent) {
        alert(`50ml 향수 #${i + 1}의 향료를 선택해주세요!`)
        return
      }
    }
    
    // 구글 스프레드시트로 주문 전송
    try {
      const { submitOrder } = await import('../../../utils/orderSubmission')
      const result = await submitOrder(formData, 'perfumer')
      
      if (result.success) {
        alert(`주문이 성공적으로 접수되었습니다!\n주문번호: ${result.orderNumber}`)
        // 폼 초기화
        setFormData({
          name: '',
          phone: '',
          xId: '',
          address: '',
          detailAddress: '',
          postalCode: '',
          quantity10ml: 0,
          perfumes10ml: [],
          quantity50ml: 0,
          perfumes50ml: [],
          additionalRequests: '',
          favoriteInfo: {
            name: '',
            type: '',
            personality: '',
            characteristics: '',
            mood: '',
            specialMemory: '',
            desiredVibe: '',
            favoriteReason: '',
            keywords: [],
            colors: [],
            images: []
          }
        })
      } else {
        alert(`주문 전송 실패: ${result.message}`)
      }
    } catch (error) {
      console.error('주문 전송 오류:', error)
      alert('주문 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-4 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-amber-200">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-4 text-center">
            <Image
              src="/main.png"
              alt="PPUDUCK 로고"
              width={300}
              height={100}
              className="h-20 w-auto mx-auto"
              priority
            />
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <Link href="/">
            <button className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              홈으로 돌아가기
            </button>
          </Link>
        </div>
        {/* 주문 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 최애 정보 섹션 - 조향사 베이스 전용 */}
          <FavoriteInfoSection 
            favoriteInfo={formData.favoriteInfo}
            onUpdate={updateFavoriteInfo}
          />

          {/* 상품 선택 */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🌟 상품 선택</h2>
            
            <div className="space-y-4">
              <ProductSection
                type="10ml"
                quantity={formData.quantity10ml}
                perfumes={formData.perfumes10ml}
                onQuantityChange={(change) => updateQuantity('10ml', change)}
                onPerfumeUpdate={(index, field, value) => updatePerfumeItem('10ml', index, field, value)}
              />
              
              <ProductSection
                type="50ml"
                quantity={formData.quantity50ml}
                perfumes={formData.perfumes50ml}
                onQuantityChange={(change) => updateQuantity('50ml', change)}
                onPerfumeUpdate={(index, field, value) => updatePerfumeItem('50ml', index, field, value)}
              />
            </div>
          </div>          {/* 주문자 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 주문자 정보</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                    placeholder="주문자 성함"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X(트위터) 아이디</label>
                <input
                  type="text"
                  name="xId"
                  value={formData.xId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                  placeholder="@username (선택사항)"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">배송 주소 *</label>
                
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                  placeholder="기본 주소"
                />
                
                <input
                  type="text"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                  placeholder="상세 주소"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">추가 요청사항</label>
                <textarea
                  name="additionalRequests"
                  value={formData.additionalRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm resize-none"
                  placeholder="배송 시 특별한 요청사항"
                />
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <OrderSummary 
            perfumes10ml={formData.perfumes10ml} 
            perfumes50ml={formData.perfumes50ml}
            subtotal={calculateSubtotal()}
            shipping={calculateShipping()}
            total={calculateTotal()}
          />

          {/* 계좌 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">💳 계좌 정보</h2>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">아래 계좌로 총 결제금액을 입금해주세요</p>                
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-600">은행명</span>
                      <p className="font-medium text-gray-800">토스뱅크</p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-600">계좌번호</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <p className="text-lg font-semibold text-amber-700 font-mono">1001-9326-0429</p>
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className={`px-3 py-1 rounded text-sm transition-all ${
                            copySuccess 
                              ? 'bg-green-500 text-white' 
                              : 'bg-amber-400 hover:bg-amber-500 text-white'
                          }`}
                        >
                          {copySuccess ? '복사됨' : '복사'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-600">예금주</span>
                      <p className="font-medium text-gray-800">ㅇㄷㅈ</p>
                    </div>
                  </div>
                </div>                
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• 입금자명은 주문자명과 동일하게 해주세요</p>
                  <p>• 제작 기간은 약 2주 소요됩니다</p>
                  <p>• 5만원 이상 주문시 배송비 무료!</p>
                  <p>• 조향사가 최애 정보를 바탕으로 특별한 향수를 만들어드립니다</p>
                  <p className="text-red-600 font-semibold">🎉 50ml 런칭 특가: 58,000원 → 48,000원 (7월 14일까지)</p>
                </div>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="text-center">
            <button
              type="submit"
              disabled={formData.quantity10ml === 0 && formData.quantity50ml === 0}
              className={`px-8 py-3 text-base font-medium rounded-lg transition-all ${
                (formData.quantity10ml === 0 && formData.quantity50ml === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {(formData.quantity10ml === 0 && formData.quantity50ml === 0) 
                ? '상품을 선택해주세요' 
                : `${calculateTotal().toLocaleString()}원 주문하기`
              }
            </button>
            
            <p className="text-gray-500 text-xs mt-2">
              주문 버튼을 누르면 입력하신 정보로 주문이 접수됩니다
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}