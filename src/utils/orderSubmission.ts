// 구글 Apps Script 웹앱 URL (배포 후 받게 될 URL)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWgmTVXGD5bPDBVuoDH0bGHqDYx6za55LMDbp3cLkTDctFUnpU6FIy58nTbIVRf0IETg/exec'

/*
=== Apps Script 수정이 필요한 부분 ===

1. handleAIOrder와 handlePerfumerOrder 함수 끝부분에 추가:
   // 배송 양식 데이터 저장
   if (data.shippingFormat && data.shippingFormat.length > 0) {
     saveShippingData(data.shippingFormat);
   }

2. 새로운 함수 추가:
   function saveShippingData(shippingRows) {
     const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
     let sheet = spreadsheet.getSheetByName('배송양식');
     
     if (!sheet) {
       sheet = spreadsheet.insertSheet('배송양식');
       const headers = [
         '받는분주소(전체)', '받는분주소(분할)', '받는분성명', 
         '받는분전화번호', '받는분기타연락처', '배송메세지1', 
         '내용명', '내용수량', '등록일시'
       ];
       sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
     }
     
     shippingRows.forEach(row => {
       sheet.appendRow([
         row.받는분주소전체,
         row.받는분주소분할,
         row.받는분성명,
         row.받는분전화번호,
         row.받는분기타연락처,
         row.배송메세지1,
         row.내용명,
         row.내용수량,
         new Date()
       ]);
     });
   }
*/

/**
 * 주문 데이터를 배송 양식에 맞게 변환
 */
function formatForShipping(orderData: any, orderType: 'ai' | 'perfumer'): any[] {
  const shippingRows = []
  
  // 전체 주소 조합
  const fullAddress = `${orderData.address}${orderData.detailAddress ? ' ' + orderData.detailAddress : ''}`
  
  // 10ml 향수들 처리
  for (let i = 0; i < orderData.quantity10ml; i++) {
    const perfume = orderData.perfumes10ml[i]
    const contentName = perfume?.labelingNickname || `${perfume?.selectedScent?.name || '향수'} 10ml`
    
    shippingRows.push({
      받는분주소전체: fullAddress,
      받는분주소분할: orderData.address,
      받는분성명: orderData.name,
      받는분전화번호: orderData.phone,
      받는분기타연락처: orderData.xId || '',
      배송메세지1: orderData.additionalRequests || '',
      내용명: contentName,
      내용수량: 1
    })
  }
  
  // 50ml 향수들 처리
  for (let i = 0; i < orderData.quantity50ml; i++) {
    const perfume = orderData.perfumes50ml[i]
    const contentName = perfume?.labelingNickname || `${perfume?.selectedScent?.name || '향수'} 50ml`
    
    shippingRows.push({
      받는분주소전체: fullAddress,
      받는분주소분할: orderData.address,
      받는분성명: orderData.name,
      받는분전화번호: orderData.phone,
      받는분기타연락처: orderData.xId || '',
      배송메세지1: orderData.additionalRequests || '',
      내용명: contentName,
      내용수량: 1
    })
  }
  
  return shippingRows
}

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
    
    if (orderType === 'perfumer' && orderData.favoriteInfo) {
      console.log('=== 이미지 URL 디버깅 ===')
      console.log('원본 favoriteInfo.imageUrls:', orderData.favoriteInfo.imageUrls)
      console.log('imageUrls 타입:', typeof orderData.favoriteInfo.imageUrls)
      console.log('imageUrls 길이:', orderData.favoriteInfo.imageUrls?.length)
      console.log('imageUrls 내용:', JSON.stringify(orderData.favoriteInfo.imageUrls, null, 2))
      
      // 이미지 파일은 제외하고, 이미지 URL은 포함
      processedData.favoriteInfo = {
        ...orderData.favoriteInfo,
        images: [], // 파일 객체는 제외
        imageUrls: orderData.favoriteInfo.imageUrls || [] // Cloudinary URL은 포함
      }
      
      console.log('처리된 favoriteInfo.imageUrls:', processedData.favoriteInfo.imageUrls)
      console.log('=== 이미지 URL 디버깅 끝 ===')
    }
    
    // 배송 양식 데이터 생성
    const shippingData = formatForShipping(orderData, orderType)
    
    // 디버깅용 상세 로그 추가
    console.log('=== 배송 양식 디버깅 ===')
    console.log('생성된 배송 데이터 개수:', shippingData.length)
    console.log('배송 데이터 상세:', JSON.stringify(shippingData, null, 2))
    console.log('orderData.quantity10ml:', orderData.quantity10ml)
    console.log('orderData.quantity50ml:', orderData.quantity50ml)
    console.log('orderData.perfumes10ml:', orderData.perfumes10ml)
    console.log('orderData.perfumes50ml:', orderData.perfumes50ml)
    
    // 전송할 최종 데이터 (기존 데이터 + 배송 양식 데이터)
    const finalData = {
      ...processedData,
      shippingFormat: shippingData // 세번째 시트용 배송 양식 데이터
    }
    
    console.log('전송할 데이터 크기:', JSON.stringify(finalData).length, '바이트')
    console.log('전송할 데이터 샘플:', {
      orderType: finalData.orderType,
      name: finalData.name,
      dataKeys: Object.keys(finalData),
      shippingRowsCount: finalData.shippingFormat.length
    })
    
    console.log('fetch 요청 시작...')
    const startTime = Date.now()
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(finalData),
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