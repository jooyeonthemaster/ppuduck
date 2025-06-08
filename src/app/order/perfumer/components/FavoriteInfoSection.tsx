import React, { useRef, useState } from 'react'
import { FavoriteInfo } from '../types'
import { FAVORITE_TYPES } from '../constants'

interface FavoriteInfoSectionProps {
  favoriteInfo: FavoriteInfo
  onUpdate: (info: FavoriteInfo) => void
}

export default function FavoriteInfoSection({ favoriteInfo, onUpdate }: FavoriteInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [currentColor, setCurrentColor] = useState('')

  const handleInputChange = (field: keyof FavoriteInfo, value: any) => {
    onUpdate({
      ...favoriteInfo,
      [field]: value
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files).slice(0, 3 - favoriteInfo.images.length)
    const updatedImages = [...favoriteInfo.images, ...newFiles].slice(0, 3)
    
    // 미리보기 이미지 생성
    const previews: string[] = []
    updatedImages.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === updatedImages.length) {
          setImagePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
    
    onUpdate({ ...favoriteInfo, images: updatedImages })
  }

  const removeImage = (index: number) => {
    const updatedImages = favoriteInfo.images.filter((_, i) => i !== index)
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index)
    setImagePreviews(updatedPreviews)
    onUpdate({ ...favoriteInfo, images: updatedImages })
  }

  const addKeyword = () => {
    if (currentKeyword.trim() && favoriteInfo.keywords.length < 10) {
      onUpdate({
        ...favoriteInfo,
        keywords: [...favoriteInfo.keywords, currentKeyword.trim()]
      })
      setCurrentKeyword('')
    }
  }

  const removeKeyword = (index: number) => {
    const updatedKeywords = favoriteInfo.keywords.filter((_, i) => i !== index)
    onUpdate({ ...favoriteInfo, keywords: updatedKeywords })
  }

  const addColor = () => {
    if (currentColor.trim() && favoriteInfo.colors.length < 5) {
      onUpdate({
        ...favoriteInfo,
        colors: [...favoriteInfo.colors, currentColor.trim()]
      })
      setCurrentColor('')
    }
  }

  const removeColor = (index: number) => {
    const updatedColors = favoriteInfo.colors.filter((_, i) => i !== index)
    onUpdate({ ...favoriteInfo, colors: updatedColors })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💕</span>
        <h2 className="text-lg font-semibold text-gray-800">최애 정보</h2>
      </div>
      
      <div className="space-y-6">
        {/* 기본 정보 섹션 */}
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-pink-700 mb-3 flex items-center gap-2">
            <span>✨</span> 기본 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 최애 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최애 이름 *</label>
              <input
                type="text"
                value={favoriteInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                placeholder="최애의 이름을 입력해주세요"
              />
            </div>
            
            {/* 최애 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최애 타입 *</label>
              <select
                value={favoriteInfo.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              >
                <option value="">선택해주세요</option>
                {FAVORITE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 성격 & 특징 섹션 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-blue-700 mb-3 flex items-center gap-2">
            <span>🌟</span> 성격 & 특징
          </h3>
          
          <div className="space-y-4">
            {/* 성격 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">성격 *</label>
              <textarea
                value={favoriteInfo.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm resize-none"
                placeholder="최애의 성격을 설명해주세요 (예: 활발하고 긍정적인, 차분하고 신중한 등)"
              />
            </div>

            {/* 특징 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">특징 및 매력 포인트 *</label>
              <textarea
                value={favoriteInfo.characteristics}
                onChange={(e) => handleInputChange('characteristics', e.target.value)}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm resize-none"
                placeholder="최애의 특징이나 매력 포인트를 알려주세요"
              />
            </div>
          </div>
        </div>

        {/* 키워드 & 색상 섹션 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-purple-700 mb-3 flex items-center gap-2">
            <span>🏷️</span> 키워드 & 색상
          </h3>
          
          <div className="space-y-4">
            {/* 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최애 관련 키워드 (최대 10개)</label>
              <div className="space-y-2">
                {favoriteInfo.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {favoriteInfo.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                      >
                        #{keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="ml-1 text-purple-500 hover:text-purple-700"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {favoriteInfo.keywords.length < 10 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      placeholder="키워드 입력 (예: 귀여운, 쿨한, 친근한)"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      disabled={!currentKeyword.trim()}
                      className="px-3 py-1.5 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">• 최애를 표현하는 키워드들을 추가해주세요</p>
              </div>
            </div>

            {/* 색상 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최애와 연관된 색상 (최대 5개)</label>
              <div className="space-y-2">
                {favoriteInfo.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {favoriteInfo.colors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                      >
                        🎨 {color}
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="ml-1 text-indigo-500 hover:text-indigo-700"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {favoriteInfo.colors.length < 5 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      placeholder="색상 입력 (예: 하늘색, 분홍색, 골드)"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addColor()}
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      disabled={!currentColor.trim()}
                      className="px-3 py-1.5 bg-indigo-400 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">• 최애를 떠올리게 하는 색상들을 추가해주세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 추억 & 감정 섹션 */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-yellow-700 mb-3 flex items-center gap-2">
            <span>💭</span> 추억 & 감정
          </h3>
          
          <div className="space-y-4">
            {/* 좋아하게 된 계기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최애를 좋아하게 된 계기</label>
              <textarea
                value={favoriteInfo.favoriteReason}
                onChange={(e) => handleInputChange('favoriteReason', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm resize-none"
                placeholder="어떻게 최애를 알게 되었고, 왜 좋아하게 되었나요?"
              />
            </div>

            {/* 분위기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최애가 주는 분위기</label>
              <input
                type="text"
                value={favoriteInfo.mood}
                onChange={(e) => handleInputChange('mood', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm"
                placeholder="예: 상쾌한 아침, 따뜻한 햇살, 신비로운 밤"
              />
            </div>

            {/* 특별한 기억 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">특별한 기억이나 에피소드</label>
              <textarea
                value={favoriteInfo.specialMemory}
                onChange={(e) => handleInputChange('specialMemory', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 text-sm resize-none"
                placeholder="최애와 관련된 특별한 기억이나 에피소드가 있다면 공유해주세요"
              />
            </div>
          </div>
        </div>

        {/* 향수 분위기 섹션 */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-green-700 mb-3 flex items-center gap-2">
            <span>🌸</span> 향수 분위기
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">원하는 향수 분위기 *</label>
            <textarea
              value={favoriteInfo.desiredVibe}
              onChange={(e) => handleInputChange('desiredVibe', e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 text-sm resize-none"
              placeholder="최애를 떠올릴 수 있는 향수는 어떤 분위기였으면 좋겠나요? 구체적으로 설명해주세요!"
            />
          </div>
        </div>

        {/* 최애 이미지 업로드 */}
        <div className="bg-rose-50 rounded-lg p-4">
          <h3 className="text-md font-medium text-rose-700 mb-3 flex items-center gap-2">
            <span>📸</span> 최애 이미지
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최애 이미지 (최대 3장)</label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`최애 이미지 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {favoriteInfo.images.length < 3 && (
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-400 transition-colors flex items-center justify-center"
                    >
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-500">이미지 추가</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">• 최애의 모습을 잘 보여주는 이미지를 올려주세요</p>
            </div>
          </div>
        </div>

        {/* 도움말 섹션 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">💡</span>
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">조향사 팁!</h4>
              <p className="text-xs text-amber-700">
                최애에 대한 정보를 상세하게 적어주실수록 더 완벽한 향수를 만들어드릴 수 있어요! 
                성격, 분위기, 색상, 키워드 등 모든 정보가 향수 조향에 도움이 됩니다. 💖
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}