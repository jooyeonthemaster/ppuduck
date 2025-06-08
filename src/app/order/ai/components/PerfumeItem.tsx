'use client'

import React from 'react'
import { PerfumeItem as PerfumeItemType, Scent } from '../types'
import { PERFUME_COLORS } from '../constants'
import ScentSelector from './ScentSelector'

interface PerfumeItemProps {
  perfume: PerfumeItemType
  index: number
  type: '10ml' | '50ml'
  onUpdate: (field: keyof PerfumeItemType, value: any) => void
}

const PerfumeItem: React.FC<PerfumeItemProps> = ({ perfume, index, type, onUpdate }) => {
  const isComplete = perfume.selectedScent && (type === '50ml' || perfume.perfumeColor)

  return (
    <div className={`p-4 border rounded-lg transition-all ${isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-700 text-sm">
          {type} 향수 #{index + 1}
        </h5>
        <span className="text-sm text-gray-500">
          {type === '10ml' ? '24,000원' : '58,000원'}
        </span>
      </div>
      
      <div className="space-y-3">
        {/* 향료 선택 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">향료 선택 *</label>
          <ScentSelector
            selectedScent={perfume.selectedScent}
            onScentSelect={(scent) => onUpdate('selectedScent', scent)}
            placeholder="향료를 선택하세요"
          />
        </div>

        {/* 10ml 전용 옵션들 */}
        {type === '10ml' && (
          <>
            {/* 색상 선택 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">향수 색상 *</label>
              <select
                value={perfume.perfumeColor}
                onChange={(e) => onUpdate('perfumeColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
              >
                <option value="">색상 선택</option>
                {PERFUME_COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* 강도 선택 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">향의 강도</label>
              <div className="grid grid-cols-2 gap-2">
                {['연하게', '진하게'].map(intensity => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => onUpdate('perfumeIntensity', intensity)}
                    className={`py-1.5 px-3 rounded-lg text-sm transition-all ${
                      perfume.perfumeIntensity === intensity
                        ? 'bg-amber-400 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 라벨링 닉네임 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">라벨링 닉네임</label>
          <input
            type="text"
            value={perfume.labelingNickname}
            onChange={(e) => onUpdate('labelingNickname', e.target.value)}
            placeholder="향수병에 새길 이름"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default PerfumeItem