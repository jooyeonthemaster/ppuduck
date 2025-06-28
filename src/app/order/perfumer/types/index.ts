// 향료 타입 정의
export interface Scent {
  id: string
  name: string
  category: 'citrus' | 'floral' | 'woody' | 'musky' | 'fruity' | 'spicy'
}

// 개별 향수 아이템 인터페이스
export interface PerfumeItem {
  id: string
  selectedScent?: Scent | null  // 단일 향료 선택 (조향사가 선택하므로 optional)
  perfumeColor: string
  perfumeIntensity: '연하게' | '진하게'
  labelingNickname: string
}

// 최애 정보 인터페이스
export interface FavoriteInfo {
  name: string
  type: string // 애니 캐릭터, 연예인, 아이돌 등
  personality: string // 성격
  characteristics: string // 특징
  mood: string // 분위기
  specialMemory: string // 특별한 기억이나 에피소드
  desiredVibe: string // 원하는 향수 분위기
  favoriteReason: string // 최애를 좋아하게 된 계기
  keywords: string[] // 최애 관련 키워드들 (최대 10개)
  colors: string[] // 최애와 연관된 색상들 (최대 5개)
  images: File[] // 이미지 파일들
  imageUrls: string[] // Cloudinary 업로드된 이미지 URL들
}

// 폼 데이터 인터페이스
export interface FormData {
  name: string
  phone: string
  xId: string
  address: string
  detailAddress: string
  postalCode: string
  // 10ml 향수들 (각각 개별 설정)
  quantity10ml: number
  perfumes10ml: PerfumeItem[]
  // 50ml 향수들 (각각 개별 설정)
  quantity50ml: number
  perfumes50ml: PerfumeItem[]
  additionalRequests: string
  // 조향사 베이스 전용 필드
  favoriteInfo: FavoriteInfo
}

// 카테고리 타입
export interface Category {
  value: string
  label: string
  icon: string
  color: string
}