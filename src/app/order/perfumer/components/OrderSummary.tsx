'use client'

import React from 'react'
import { PerfumeItem } from '../types'
import { PRICES } from '../constants'

interface OrderSummaryProps {
  perfumes10ml: PerfumeItem[]
  perfumes50ml: PerfumeItem[]
  subtotal: number
  shipping: number
  total: number
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ perfumes10ml, perfumes50ml, subtotal, shipping, total }) => {
  const total10ml = perfumes10ml.length * PRICES['10ml']
  const total50ml = perfumes50ml.length * PRICES['50ml']

  if (perfumes10ml.length === 0 && perfumes50ml.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 주문 요약</h2>
      
      <div className="space-y-3">
        {/* 10ml 향수들 */}
        {perfumes10ml.length > 0 && (
          <div>            <h3 className="text-sm font-medium text-gray-700 mb-2">10ml 향수 ({perfumes10ml.length}개)</h3>
            <div className="space-y-2">
              {perfumes10ml.map((perfume, index) => (
                <div key={perfume.id} className="text-sm text-gray-600 pl-4">
                  <span>#{index + 1}</span>
                  {perfume.selectedScent && (
                    <span> - {perfume.selectedScent.name}</span>
                  )}
                  {perfume.perfumeColor && (
                    <span> ({perfume.perfumeColor})</span>
                  )}
                  {perfume.labelingNickname && (
                    <span> "{perfume.labelingNickname}"</span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-right text-gray-700 mt-1">
              소계: {total10ml.toLocaleString()}원
            </div>
          </div>
        )}

        {/* 50ml 향수들 */}
        {perfumes50ml.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">50ml 향수 ({perfumes50ml.length}개)</h3>
            <div className="space-y-2">
              {perfumes50ml.map((perfume, index) => (
                <div key={perfume.id} className="text-sm text-gray-600 pl-4">                  <span>#{index + 1}</span>
                  {perfume.selectedScent && (
                    <span> - {perfume.selectedScent.name}</span>
                  )}
                  {perfume.labelingNickname && (
                    <span> "{perfume.labelingNickname}"</span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-right text-gray-700 mt-1">
              소계: {total50ml.toLocaleString()}원
            </div>
          </div>
        )}
        
        {/* 소계 */}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">상품 소계</span>
            <span className="text-sm text-gray-800">
              {subtotal.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 배송비 */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">배송비</span>
          <span className="text-sm text-gray-800">            {shipping === 0 ? (
              <span className="text-green-600 font-medium">무료</span>
            ) : (
              `${shipping.toLocaleString()}원`
            )}
          </span>
        </div>

        {/* 5만원 이상 무료배송 안내 */}
        {shipping > 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            💡 5만원 이상 주문시 배송비 무료!
          </div>
        )}

        {/* 총액 */}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-800">총 결제금액</span>
            <span className="text-lg font-bold text-amber-600">
              {total.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary