import { Scent, Category } from '../types'

// 30가지 향료 데이터
export const SCENTS: Scent[] = [
  { id: "BK-2201281", name: "블랙베리", category: "fruity" },
  { id: "MD-8602341", name: "만다린 오렌지", category: "citrus" },
  { id: "ST-3503281", name: "스트로베리", category: "fruity" },
  { id: "BG-8704231", name: "베르가못", category: "citrus" },
  { id: "BO-6305221", name: "비터오렌지", category: "spicy" },
  { id: "CR-3706221", name: "캐럿", category: "floral" },
  { id: "RS-2807221", name: "로즈", category: "floral" },
  { id: "TB-2808221", name: "튜베로즈", category: "floral" },
  { id: "OB-6809221", name: "오렌지 블라썸", category: "floral" },
  { id: "TL-2810221", name: "툴립", category: "floral" },
  { id: "LM-7211441", name: "라임", category: "citrus" },
  { id: "LV-2812221", name: "은방울꽃", category: "floral" },
  { id: "YJ-8213431", name: "유자", category: "citrus" },
  { id: "MT-8614231", name: "민트", category: "citrus" },
  { id: "PT-8415331", name: "페티그레인", category: "citrus" },
  { id: "SD-2216141", name: "샌달우드", category: "woody" },
  { id: "LP-6317181", name: "레몬페퍼", category: "spicy" },
  { id: "PP-3218181", name: "핑크 페퍼", category: "spicy" },
  { id: "SS-8219241", name: "바다소금", category: "citrus" },
  { id: "TM-2320461", name: "타임", category: "woody" },
  { id: "MS-2621712", name: "머스크", category: "musky" },
  { id: "WR-2622131", name: "화이트 로즈", category: "floral" },
  { id: "SW-2623121", name: "스웨이드", category: "woody" },
  { id: "IM-4324311", name: "이탈리안만다린", category: "musky" },
  { id: "LV-2225161", name: "라벤더", category: "woody" },
  { id: "IC-3126171", name: "이탈리안사이프러스", category: "woody" },
  { id: "SW-1227171", name: "스모키 블렌드 우드", category: "woody" },
  { id: "LD-2128524", name: "레더", category: "spicy" },
  { id: "VL-2129241", name: "바이올렛", category: "woody" },
  { id: "FG-3430721", name: "무화과", category: "musky" }
]

// 카테고리 데이터
export const CATEGORIES: Category[] = [
  { value: 'all', label: '전체', icon: '🌟', color: 'from-amber-400 to-yellow-400' },
  { value: 'citrus', label: 'Citrus', icon: '🍊', color: 'from-orange-400 to-yellow-400' },
  { value: 'floral', label: 'Floral', icon: '🌸', color: 'from-pink-400 to-rose-400' },
  { value: 'woody', label: 'Woody', icon: '🌳', color: 'from-amber-500 to-orange-500' },
  { value: 'musky', label: 'Musky', icon: '🌙', color: 'from-gray-500 to-slate-600' },
  { value: 'fruity', label: 'Fruity', icon: '🍓', color: 'from-red-400 to-pink-400' },
  { value: 'spicy', label: 'Spicy', icon: '🌶️', color: 'from-yellow-500 to-red-500' }
]

// 향수 색상 옵션
export const PERFUME_COLORS = ['빨강', '노랑', '초록', '파랑', '보라', '분홍']

// 가격 정보
export const PRICES = {
  '10ml': 24000,
  '50ml': 58000
}

// 최애 타입 옵션
export const FAVORITE_TYPES = [
  '애니메이션 캐릭터',
  '아이돌',
  '연예인',
  '게임 캐릭터',
  '가상 유튜버',
  '기타'
]