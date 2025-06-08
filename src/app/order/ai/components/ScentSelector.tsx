'use client'

import React, { useState } from 'react'
import { Scent } from '../types'
import { SCENTS, CATEGORIES } from '../constants'

interface ScentSelectorProps {
  onScentSelect?: (scent: Scent | null) => void
  placeholder?: string
  selectedScent?: Scent | null
}

const ScentSelector: React.FC<ScentSelectorProps> = ({ 
  onScentSelect,
  placeholder = "향료를 선택하세요",
  selectedScent: initialSelected = null
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedScent, setSelectedScent] = useState<Scent | null>(initialSelected)

  // 필터링된 향료 목록
  const filteredScents = SCENTS.filter(scent => {
    const matchesSearch = scent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scent.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || scent.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 향료 선택 핸들러 (단일 선택)
  const handleScentSelect = (scent: Scent) => {
    const newSelected = selectedScent?.id === scent.id ? null : scent
    setSelectedScent(newSelected)
    onScentSelect?.(newSelected)
    setIsOpen(false) // 선택 후 모달 닫기
  }

  // 모달 닫기
  const handleClose = () => {
    setIsOpen(false)
    setSearchTerm('')
    setSelectedCategory('all')
  }

  // 카테고리별 색상 및 이모지
  const getCategoryInfo = (category: string) => {
    const categoryInfo = {
      citrus: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '🍊' },
      floral: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: '🌸' },
      woody: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🌳' },
      musky: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '🌙' },
      fruity: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🍓' },
      spicy: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🌶️' }
    }
    return categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.woody
  }
  return (
    <>
      {/* 선택 버튼 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-3 py-2 text-left border border-amber-200 rounded-lg bg-white hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-colors text-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {selectedScent ? (
                <div className="flex items-center gap-2">
                  <span className="text-base">{getCategoryInfo(selectedScent.category).icon}</span>
                  <span className="font-medium text-gray-800">{selectedScent.name}</span>
                  <span className="text-xs text-gray-500">({selectedScent.id})</span>
                </div>
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">향료 선택</h2>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* 검색 및 카테고리 필터 */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="mb-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="향료 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => {
                  const isSelected = selectedCategory === category.value
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`flex items-center px-3 py-1 rounded-lg text-sm transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${category.color} text-white shadow-sm`
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span className="mr-1">{category.icon}</span>
                      <span>{category.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {/* 향료 목록 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {filteredScents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2 text-sm">검색 결과가 없습니다</p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                    }}
                    className="px-3 py-1.5 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors text-sm"
                  >
                    필터 초기화
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredScents.map(scent => {
                    const isSelected = selectedScent?.id === scent.id
                    const categoryInfo = getCategoryInfo(scent.category)
                    
                    return (
                      <div
                        key={scent.id}
                        onClick={() => handleScentSelect(scent)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-amber-400 bg-amber-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <span className="mr-1.5">{categoryInfo.icon}</span>
                          <span className={`text-xs ${isSelected ? 'text-amber-700 font-medium' : 'text-gray-600'}`}>
                            {scent.id}
                          </span>
                        </div>
                        <p className={`font-medium text-sm ${isSelected ? 'text-amber-800' : 'text-gray-800'}`}>
                          {scent.name}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border} border`}>
                          {scent.category}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={handleClose}
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all text-sm font-medium"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ScentSelector