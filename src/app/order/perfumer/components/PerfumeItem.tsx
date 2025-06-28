'use client'

import React from 'react'
import { PerfumeItem as PerfumeItemType } from '../types'
import { PERFUME_COLORS } from '../constants'

interface PerfumeItemProps {
  perfume: PerfumeItemType
  index: number
  type: '10ml' | '50ml'
  onUpdate: (field: keyof PerfumeItemType, value: any) => void
}

const PerfumeItem: React.FC<PerfumeItemProps> = ({ perfume, index, type, onUpdate }) => {
  const isComplete = type === '50ml' || perfume.perfumeColor

  return (
    <div className={`p-4 border rounded-lg transition-all ${isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-700 text-sm">
          {type} 향수 #{index + 1}
        </h5>
        <span className="text-sm text-gray-500">
          {type === '10ml' ? '24,000원' : (
            <div className="flex flex-col items-end">
              <span className="line-through text-xs text-gray-400">58,000원</span>
              <span className="text-red-600 font-bold">48,000원</span>
            </div>
          )}
        </span>
      </div>
      
      <div className="space-y-3">
        {/* 조향사가 최애 정보를 바탕으로 향료를 선택해드립니다 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            조향사가 최애 정보를 바탕으로 향료를 선택해드립니다
          </p>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">색의 농도</label>
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
              {perfume.perfumeIntensity === '진하게' && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    ⚠️ 진한 색상은 흰 천에 분사시 착색될 수 있습니다
                  </p>
                </div>
              )}
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