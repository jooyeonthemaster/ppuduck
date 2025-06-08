// 향료 타입 정의
export interface Scent {
  id: string
  name: string
  category: 'citrus' | 'floral' | 'woody' | 'musky' | 'fruity' | 'spicy'
}

// 개별 향수 아이템 인터페이스
export interface PerfumeItem {
  id: string
  selectedScent: Scent | null  // 단일 향료 선택
  perfumeColor: string
  perfumeIntensity: '연하게' | '진하게'
  labelingNickname: string
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
}

// 카테고리 타입
export interface Category {
  value: string
  label: string
  icon: string
  color: string
}