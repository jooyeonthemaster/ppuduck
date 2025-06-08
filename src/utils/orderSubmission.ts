// 구글 Apps Script 웹앱 URL (배포 후 받게 될 URL)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzi3WDfXg7yBxtjRYuLtlhA5kpHX-MgBmBguYFPgiW6KtBnRHT8wxwW-byQvt8Rsh-S4w/exec'

/**
 * Apps Script 연결 테스트
 */
export async function testConnection(): Promise<{
  success: boolean
  message: string
}> {
  console.log('Apps Script 연결 테스트 시작...')
  
  try {
    // GET 요청으로 연결 테스트
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
    })
    
    console.log('테스트 응답 상태:', response.status, response.statusText)
    console.log('테스트 응답 헤더:', [...response.headers.entries()])
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('테스트 응답 에러:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const result = await response.json()
    console.log('테스트 응답 결과:', result)
    
    return {
      success: true,
      message: `연결 성공! 응답: ${result.message || 'OK'}`
    }
    
  } catch (error) {
    console.error('연결 테스트 실패:', error)
    
    let errorMessage = '연결 테스트 실패: '
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage += 'CORS 문제 또는 Apps Script 접근 불가. Apps Script가 제대로 배포되었는지 확인하세요.'
    } else if (error instanceof Error) {
      errorMessage += error.message
    } else {
      errorMessage += '알 수 없는 에러'
    }
    
    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * 주문 데이터를 구글 스프레드시트로 전송
 */
export async function submitOrder(orderData: any, orderType: 'ai' | 'perfumer'): Promise<{
  success: boolean
  message: string
  orderNumber?: string
}> {
  console.log('=== 주문 전송 시작 ===')
  console.log('주문 타입:', orderType)
  console.log('Apps Script URL:', APPS_SCRIPT_URL)
  console.log('브라우저 정보:', {
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled
  })
  
  try {
    // 이미지 파일 처리 (조향사 베이스의 경우)
    let processedData = { ...orderData, orderType }
    
    if (orderType === 'perfumer' && orderData.favoriteInfo?.images?.length > 0) {
      // 이미지는 일단 제외하고 전송 (나중에 별도 처리 가능)
      processedData.favoriteInfo = {
        ...orderData.favoriteInfo,
        images: [] // 이미지는 현재 버전에서는 제외
      }
    }
    
    console.log('전송할 데이터 크기:', JSON.stringify(processedData).length, '바이트')
    console.log('전송할 데이터 샘플:', {
      orderType: processedData.orderType,
      name: processedData.name,
      dataKeys: Object.keys(processedData)
    })
    
    console.log('fetch 요청 시작...')
    const startTime = Date.now()
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(processedData),
    })
    
    const endTime = Date.now()
    console.log(`응답 시간: ${endTime - startTime}ms`)
    console.log('응답 상태:', response.status, response.statusText)
    console.log('응답 헤더:', [...response.headers.entries()])
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('응답 에러 내용:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const result = await response.json()
    console.log('=== 응답 성공 ===')
    console.log('응답 결과:', result)
    return result
    
  } catch (error) {
    console.error('=== 주문 전송 실패 ===')
    console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('전체 에러:', error)
    
    // 구체적인 에러 메시지 제공
    let errorMessage = '주문 전송 중 오류가 발생했습니다.'
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = `
서버 연결에 실패했습니다. 가능한 원인:
1. Apps Script가 제대로 배포되지 않음
2. 인터넷 연결 문제
3. CORS 설정 문제
4. Apps Script 권한 문제

브라우저 콘솔을 확인하고 다시 시도해주세요.`
    } else if (error instanceof Error) {
      errorMessage = `에러: ${error.message}`
    }
    
    return {
      success: false,
      message: errorMessage
    }
  }
} 