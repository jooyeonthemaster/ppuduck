import React, { useRef, useState, useCallback } from 'react'
import { FavoriteInfo } from '../types'
import { FAVORITE_TYPES } from '../constants'

interface FavoriteInfoSectionProps {
  favoriteInfo: FavoriteInfo
  onUpdate: (info: FavoriteInfo | ((prev: FavoriteInfo) => FavoriteInfo)) => void
}

export default function FavoriteInfoSection({ favoriteInfo, onUpdate }: FavoriteInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [currentColor, setCurrentColor] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleInputChange = (field: keyof FavoriteInfo, value: any) => {
    onUpdate({
      ...favoriteInfo,
      [field]: value
    })
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    console.log('🔄 Cloudinary 업로드 시작:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    })
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'idforidol-uploads')
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    console.log('📡 Cloudinary API URL:', cloudinaryUrl)
    
    try {
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      })
      
      console.log('📥 Cloudinary 응답 상태:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Cloudinary 에러 응답:', errorText)
        throw new Error(`Cloudinary 업로드 실패: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Cloudinary 응답 데이터:', data)
      
      if (!data.secure_url) {
        throw new Error('Cloudinary에서 secure_url을 반환하지 않음')
      }
      
      console.log('🎉 최종 이미지 URL:', data.secure_url)
      return data.secure_url
    } catch (error) {
      console.error('💥 Cloudinary 업로드 에러:', error)
      throw error
    }
  }

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 현재 이미지 개수 체크
    if (favoriteInfo.imageUrls.length >= 3) {
      alert('최대 3장까지만 업로드 가능합니다.')
      return
    }

    setUploadingImage(true)

    try {
      const imageUrl = await uploadToCloudinary(file)
      console.log('업로드된 이미지 URL:', imageUrl)
      
      onUpdate((prevFavoriteInfo) => {
        const updatedImageUrls = [...(prevFavoriteInfo.imageUrls || []), imageUrl]
        console.log('업데이트된 이미지 URLs:', updatedImageUrls)
        
        return {
          ...prevFavoriteInfo,
          imageUrls: updatedImageUrls
        }
      })
      
      setTimeout(() => {
        setUploadingImage(false)
        alert('이미지가 성공적으로 업로드되었습니다!')
      }, 0)
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      setUploadingImage(false)
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
    }

    // input 값 초기화
    event.target.value = ''
  }, [favoriteInfo.imageUrls, onUpdate])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (!imageFile) {
      alert('이미지 파일을 드롭해주세요.')
      return
    }

    // 파일 크기 체크 (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    // 현재 이미지 개수 체크
    if (favoriteInfo.imageUrls.length >= 3) {
      alert('최대 3장까지만 업로드 가능합니다.')
      return
    }

    setUploadingImage(true)

    try {
      const imageUrl = await uploadToCloudinary(imageFile)
      console.log('드롭 업로드된 이미지 URL:', imageUrl)
      
      onUpdate((prevFavoriteInfo) => {
        const updatedImageUrls = [...(prevFavoriteInfo.imageUrls || []), imageUrl]
        console.log('드롭 업데이트된 이미지 URLs:', updatedImageUrls)
        
        return {
          ...prevFavoriteInfo,
          imageUrls: updatedImageUrls
        }
      })
      
      setTimeout(() => {
        setUploadingImage(false)
        alert('이미지가 성공적으로 업로드되었습니다!')
      }, 0)
      
    } catch (error) {
      console.error('드롭 이미지 업로드 실패:', error)
      setUploadingImage(false)
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
    }
  }, [favoriteInfo.imageUrls, onUpdate])

  const removeImage = (index: number) => {
    onUpdate((prevFavoriteInfo) => ({
      ...prevFavoriteInfo,
      imageUrls: prevFavoriteInfo.imageUrls.filter((_: string, i: number) => i !== index)
    }))
  }

  const addKeyword = () => {
    if (currentKeyword.trim()) {
      onUpdate((prevFavoriteInfo) => {
        if (prevFavoriteInfo.keywords.length < 10) {
          return {
            ...prevFavoriteInfo,
            keywords: [...prevFavoriteInfo.keywords, currentKeyword.trim()]
          }
        }
        return prevFavoriteInfo
      })
      setCurrentKeyword('') // 함수형 업데이트 외부로 이동
    }
  }

  const removeKeyword = (index: number) => {
    onUpdate((prevFavoriteInfo) => ({
      ...prevFavoriteInfo,
      keywords: prevFavoriteInfo.keywords.filter((_, i) => i !== index)
    }))
  }

  const addColor = () => {
    if (currentColor.trim()) {
      onUpdate((prevFavoriteInfo) => {
        if (prevFavoriteInfo.colors.length < 5) {
          return {
            ...prevFavoriteInfo,
            colors: [...prevFavoriteInfo.colors, currentColor.trim()]
          }
        }
        return prevFavoriteInfo
      })
      setCurrentColor('') // 함수형 업데이트 외부로 이동
    }
  }

  const removeColor = (index: number) => {
    onUpdate((prevFavoriteInfo) => ({
      ...prevFavoriteInfo,
      colors: prevFavoriteInfo.colors.filter((_, i) => i !== index)
    }))
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
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
          <h3 className="text-lg font-semibold text-rose-700 mb-4 flex items-center gap-2">
            <span>📸</span> 최애 이미지
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">최애 이미지 (최대 3장)</label>
            <div className="space-y-4">
              {/* 이미지 미리보기 그리드 */}
              {favoriteInfo.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favoriteInfo.imageUrls.map((url: string, index: number) => (
                    <div key={index} className="relative group">
                      <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <img
                          src={url}
                          alt={`최애 이미지 ${index + 1}`}
                          className="w-full h-32 sm:h-40 object-cover"
                          onLoad={() => {
                            console.log('이미지 로드 성공:', url)
                          }}
                          onError={(e) => {
                            console.error('이미지 로드 실패:', url)
                            console.error('Error details:', e)
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDOTIuMjY4IDgwIDg2IDg2LjI2OCA4NiA5NEM4NiAxMDEuNzMyIDkyLjI2OCAxMDggMTAwIDEwOEMxMDcuNzMyIDEwOCAxMTQgMTAxLjczMiAxMTQgOTRDMTE0IDg2LjI2OCAxMDcuNzMyIDgwIDEwMCA4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyMCAxMjBIODBWMTQwSDEyMFYxMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg0IiBmb250LXNpemU9IjEyIj7snbTrr7jsp4DroZwg7JuH7IaP7ZWY7KeAPC90ZXh0Pgo8L3N2Zz4K'
                          }}
                        />
                        {/* 호버 시에만 나타나는 삭제 버튼 오버레이 */}
                        <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-300 transform scale-90 hover:scale-100 shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
                          이미지 {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 이미지 업로드 버튼 */}
              {favoriteInfo.imageUrls.length < 3 && (
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-white to-rose-50 border-2 border-dashed border-rose-200 hover:border-rose-300 rounded-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:scale-[1.02] group"
                  >
                    <div className="text-center p-6 pointer-events-none">
                      {uploadingImage ? (
                        <>
                          <div className="relative mb-4">
                            <div className="w-12 h-12 mx-auto border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-rose-400 text-xl">📸</span>
                            </div>
                          </div>
                          <p className="text-sm text-rose-600 font-medium">이미지 업로드 중...</p>
                          <p className="text-xs text-gray-500 mt-1">잠시만 기다려주세요</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-4 relative">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-all duration-300 shadow-md">
                              <svg className="w-8 h-8 text-rose-400 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs">✨</span>
                            </div>
                          </div>
                          <p className="text-base font-semibold text-gray-700 mb-1">최애 이미지 추가</p>
                          <p className="text-sm text-gray-500 mb-2">클릭하거나 드래그해서 업로드</p>
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <span>📱</span>
                            <span>JPG, PNG, WebP 지원</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 안내 메시지 */}
              <div className="bg-white/70 rounded-lg p-3 border border-rose-100">
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">💡</span>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">이미지 업로드 팁</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 최애의 모습을 잘 보여주는 선명한 이미지를 선택해주세요</li>
                      <li>• 얼굴이 잘 보이는 사진이 향수 제작에 도움됩니다</li>
                      <li>• 다양한 각도나 표정의 사진을 올려주시면 더 좋아요</li>
                    </ul>
                  </div>
                </div>
              </div>
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