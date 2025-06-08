'use client'

import React from 'react'
import { PerfumeItem as PerfumeItemType } from '../types'
import { PRICES } from '../constants'
import PerfumeItem from './PerfumeItem'

interface ProductSectionProps {
  type: '10ml' | '50ml'
  quantity: number
  perfumes: PerfumeItemType[]
  onQuantityChange: (change: number) => void
  onPerfumeUpdate: (index: number, field: keyof PerfumeItemType, value: any) => void
}

const ProductSection: React.FC<ProductSectionProps> = ({
  type,
  quantity,
  perfumes,
  onQuantityChange,
  onPerfumeUpdate
}) => {
  const price = PRICES[type]
  const total = quantity * price
  const bgColor = type === '10ml' ? 'bg-amber-50' : 'bg-orange-50'
  const borderColor = type === '10ml' ? 'border-amber-200' : 'border-orange-200'
  const buttonColor = type === '10ml' ? 'bg-amber-400 hover:bg-amber-500' : 'bg-orange-400 hover:bg-orange-500'

  return (
    <div className={`rounded-lg p-4 border ${borderColor} ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            {type === '10ml' ? '🧪' : '🍯'} {type} 향수
          </h3>
          <p className="text-sm text-gray-600">개당 {price.toLocaleString()}원</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">소계</p>
          <p className="text-lg font-semibold text-gray-800">{total.toLocaleString()}원</p>
        </div>
      </div>
      
      {/* 수량 조절 */}
      <div className="flex items-center justify-center mb-4 gap-4">
        <button
          type="button"
          onClick={() => onQuantityChange(-1)}
          className={`w-8 h-8 rounded-full ${buttonColor} text-white font-medium transition-all disabled:opacity-50`}
          disabled={quantity === 0}
        >
          -
        </button>
        <span className="text-xl font-semibold text-gray-800 min-w-[2rem] text-center">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantityChange(1)}
          className={`w-8 h-8 rounded-full ${buttonColor} text-white font-medium transition-all`}
        >
          +
        </button>
      </div>

      {/* 개별 향수 설정 */}
      {quantity > 0 && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
          {perfumes.map((perfume, index) => (
            <PerfumeItem
              key={perfume.id}
              perfume={perfume}
              index={index}
              type={type}
              onUpdate={(field, value) => onPerfumeUpdate(index, field, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductSection