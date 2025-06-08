import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-sm">
        {/* 메인 이미지 헤더 */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 flex justify-center py-6">
          <Image
            src="/main.png"
            alt="PPUDUCK 메인 이미지"
            width={200}
            height={60}
            className="w-40 h-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* 주문 방식 선택 */}
        <div className="p-6 space-y-6">
          {/* 악센트 AI 프로그램 주문 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* BASE 라벨 */}
            <div className="mb-6 -mx-6 -mt-6 px-6 pt-4 pb-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-t-2xl">
              <div className="text-center">
                <span className="block text-lg text-white font-bold tracking-wide drop-shadow-sm">
                  🤖 악센트 AI 프로그램
                </span>
              </div>
            </div>
            
            {/* 가로 배치된 버튼들 */}
            <div className="flex gap-3">
              <a href="https://idforidol-fixed.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex-1">
                <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <div className="flex flex-col items-center">
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-bold">분석하러 가기</span>
                  </div>
                </button>
              </a>
              
              <Link href="/order/ai" className="flex-1">
                <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <div className="flex flex-col items-center">
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-sm font-bold">주문하러 가기</span>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          {/* 조향사 추천 주문 */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* BASE 라벨 */}
            <div className="mb-6 -mx-6 -mt-6 px-6 pt-4 pb-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-t-2xl">
              <div className="text-center">
                <span className="block text-lg text-white font-bold tracking-wide drop-shadow-sm">
                  👨‍🔬 조향사 추천
                </span>
              </div>
            </div>
            
            <Link href="/order/perfumer">
              <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-base">주문하러 가기</span>
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-4"></div>
      </div>
    </div>
  )
}