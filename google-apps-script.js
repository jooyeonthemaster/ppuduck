/**
 * 향수 주문 관리 Apps Script
 * AI 베이스와 조향사 베이스 주문을 각각의 시트에 저장하고 이메일 알림을 전송
 * + 배송 양식 데이터를 세번째 시트에 저장 (디버깅 강화)
 */

// 알림 받을 이메일 주소들
const NOTIFICATION_EMAILS = [
  'nadr.jooyeon@gmail.com',
  'nadr.sunflower@gmail.com', 
  'nadr.okkhoxo@gmail.com',
  'ldongju33@gmail.com'
];

// 스프레드시트 ID (현재 스프레드시트)
const SPREADSHEET_ID = '1kl-a_j-dlCTgCEGCbf4owCj1NWx0LbBX50fBJFBHdv8';

/**
 * 웹앱 GET 요청 처리 함수 (CORS Preflight 대응)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: '향수 주문 시스템이 정상 작동 중입니다.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CORS Preflight 요청 처리 (OPTIONS)
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 웹앱 POST 요청 처리 함수
 */
function doPost(e) {
  try {
    // 요청 데이터 검증
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('요청 데이터가 없습니다.');
    }
    
    console.log('받은 POST 데이터:', e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    const orderType = data.orderType; // 'ai' 또는 'perfumer'
    
    console.log('=== 전체 받은 데이터 디버깅 ===');
    console.log('전체 데이터:', JSON.stringify(data, null, 2));
    console.log('데이터 키들:', Object.keys(data));
    console.log('shippingFormat 직접 확인:', data.shippingFormat);
    console.log('shippingFormat 타입:', typeof data.shippingFormat);
    console.log('=== APPS SCRIPT 디버깅 ===');
    console.log('파싱된 데이터 키들:', Object.keys(data));
    console.log('주문 타입:', orderType);
    console.log('shippingFormat 존재 여부:', !!data.shippingFormat);
    console.log('shippingFormat 타입:', typeof data.shippingFormat);
    console.log('shippingFormat 길이:', data.shippingFormat ? data.shippingFormat.length : 'undefined');
    
    if (data.shippingFormat && data.shippingFormat.length > 0) {
      console.log('shippingFormat 첫번째 데이터:', JSON.stringify(data.shippingFormat[0]));
    } else {
      console.log('shippingFormat 데이터가 없거나 비어있음!');
    }
    
    if (!orderType) {
      throw new Error('주문 타입이 지정되지 않았습니다.');
    }
    
    if (orderType === 'ai') {
      return handleAIOrder(data);
    } else if (orderType === 'perfumer') {
      return handlePerfumerOrder(data);
    } else {
      throw new Error('유효하지 않은 주문 타입입니다: ' + orderType);
    }
    
  } catch (error) {
    console.error('주문 처리 오류:', error);
    
    // 에러 로깅을 위해 스프레드시트에 기록
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      let errorSheet = spreadsheet.getSheetByName('errors');
      if (!errorSheet) {
        errorSheet = spreadsheet.insertSheet('errors');
        errorSheet.getRange(1, 1, 1, 4).setValues([['시간', '에러 메시지', '요청 데이터', '스택 트레이스']]);
      }
      
      errorSheet.appendRow([
        new Date(),
        error.message || '알 수 없는 에러',
        e && e.postData ? e.postData.contents : '없음',
        error.stack || '스택 없음'
      ]);
    } catch (logError) {
      console.error('에러 로깅 실패:', logError);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '주문 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'),
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * AI 베이스 주문 처리
 */
function handleAIOrder(data) {
  try {
    console.log('AI 주문 처리 시작:', data);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 'ai base' 시트 가져오기 또는 생성
    let sheet = spreadsheet.getSheetByName('ai base');
    if (!sheet) {
      console.log('ai base 시트 생성 중...');
      sheet = spreadsheet.insertSheet('ai base');
      // 헤더 설정
      const headers = [
        '주문번호', '주문일시', '이름', '연락처', 'X아이디', '주소', '상세주소',
        '10ml수량', '10ml향수정보', '50ml수량', '50ml향수정보',
        '총금액', '배송비', '최종금액', '추가요청사항'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // 주문번호 생성
    const orderNumber = generateOrderNumber('AI');
    console.log('생성된 주문번호:', orderNumber);
    
    // 향수 정보 처리
    const perfumes10ml = data.perfumes10ml || [];
    const perfumes50ml = data.perfumes50ml || [];
    
    // 향수 정보를 문자열로 변환
    const perfume10mlInfo = perfumes10ml.map(p => 
      `${p.selectedScent?.name || '미선택'} (${p.perfumeColor || '색상미선택'}, ${p.perfumeIntensity || '연하게'}) - ${p.labelingNickname || '닉네임없음'}`
    ).join('; ');
    
    const perfume50mlInfo = perfumes50ml.map(p => 
      `${p.selectedScent?.name || '미선택'} (${p.perfumeColor || '색상미선택'}, ${p.perfumeIntensity || '연하게'}) - ${p.labelingNickname || '닉네임없음'}`
    ).join('; ');
    
    // 금액 계산
    const subtotal = (data.quantity10ml * 24000) + (data.quantity50ml * 48000);
    const shipping = subtotal >= 50000 ? 0 : 3500;
    const total = subtotal + shipping;
    
    // 행 데이터 준비
    const rowData = [
      orderNumber,
      new Date(),
      data.name || '',
      data.phone || '',
      data.xId || '',
      data.address || '',
      data.detailAddress || '',
      data.quantity10ml || 0,
      perfume10mlInfo,
      data.quantity50ml || 0,
      perfume50mlInfo,
      subtotal,
      shipping,
      total,
      data.additionalRequests || ''
    ];
    
    console.log('추가할 행 데이터:', rowData);
    
    // 데이터 추가
    sheet.appendRow(rowData);
    console.log('시트에 데이터 추가 완료');
    
    // 💡 배송 양식 처리 전에 로그 추가
    console.log('=== 배송 양식 처리 시작 ===');
    console.log('data.shippingFormat 체크:', !!data.shippingFormat);
    console.log('data.shippingFormat 길이:', data.shippingFormat ? data.shippingFormat.length : 0);
    
    // 배송 양식 데이터 저장
    if (data.shippingFormat && data.shippingFormat.length > 0) {
      console.log('배송 양식 데이터 저장 시작:', data.shippingFormat.length, '건');
      saveShippingData(data.shippingFormat);
      console.log('배송 양식 데이터 저장 완료');
    } else {
      console.log('⚠️ 배송 양식 데이터가 없어서 저장하지 않음');
    }
    
    // 이메일 알림 발송
    try {
      sendOrderNotification(data, 'AI 베이스 주문', orderNumber);
      console.log('이메일 알림 발송 완료');
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
      // 이메일 실패해도 주문은 성공으로 처리
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '주문이 성공적으로 접수되었습니다.',
        orderNumber: orderNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('AI 주문 처리 오류:', error);
    throw new Error('AI 주문 처리 중 오류: ' + error.message);
  }
}

/**
 * 조향사 베이스 주문 처리
 */
function handlePerfumerOrder(data) {
  try {
    console.log('조향사 주문 처리 시작:', data);
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 'perfumer base' 시트 가져오기 또는 생성
    let sheet = spreadsheet.getSheetByName('perfumer base');
    if (!sheet) {
      console.log('perfumer base 시트 생성 중...');
      sheet = spreadsheet.insertSheet('perfumer base');
      // 헤더 설정 (이미지URLs 필드 추가)
      const headers = [
        '주문번호', '주문일시', '이름', '연락처', 'X아이디', '주소', '상세주소',
        '10ml수량', '10ml향수정보', '50ml수량', '50ml향수정보',
        '총금액', '배송비', '최종금액', '추가요청사항',
        '최애이름', '최애타입', '최애성격', '최애특징', '최애분위기', 
        '특별한기억', '원하는분위기', '좋아하게된계기', '키워드', '색상', '이미지URLs'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // 주문번호 생성
    const orderNumber = generateOrderNumber('PF');
    console.log('생성된 주문번호:', orderNumber);
    
    // 향수 정보 처리
    const perfumes10ml = data.perfumes10ml || [];
    const perfumes50ml = data.perfumes50ml || [];
    
    // 향수 정보를 문자열로 변환
    const perfume10mlInfo = perfumes10ml.map(p => 
      `${p.selectedScent?.name || '미선택'} (${p.perfumeColor || '색상미선택'}, ${p.perfumeIntensity || '연하게'}) - ${p.labelingNickname || '닉네임없음'}`
    ).join('; ');
    
    const perfume50mlInfo = perfumes50ml.map(p => 
      `${p.selectedScent?.name || '미선택'} (${p.perfumeColor || '색상미선택'}, ${p.perfumeIntensity || '연하게'}) - ${p.labelingNickname || '닉네임없음'}`
    ).join('; ');
    
    // 금액 계산
    const subtotal = (data.quantity10ml * 24000) + (data.quantity50ml * 48000);
    const shipping = subtotal >= 50000 ? 0 : 3500;
    const total = subtotal + shipping;
    
    // 최애 정보 처리
    const favoriteInfo = data.favoriteInfo || {};
    console.log('최애 정보:', favoriteInfo);
    
    // 이미지 URL 디버깅
    console.log('=== Apps Script 이미지 URL 디버깅 ===');
    console.log('favoriteInfo 전체:', JSON.stringify(favoriteInfo, null, 2));
    console.log('favoriteInfo.imageUrls 직접 확인:', favoriteInfo.imageUrls);
    console.log('favoriteInfo.imageUrls 타입:', typeof favoriteInfo.imageUrls);
    console.log('favoriteInfo.imageUrls 길이:', favoriteInfo.imageUrls ? favoriteInfo.imageUrls.length : 'undefined');
    
    if (favoriteInfo.imageUrls && Array.isArray(favoriteInfo.imageUrls)) {
      console.log('이미지 URLs 배열 내용:');
      favoriteInfo.imageUrls.forEach((url, index) => {
        console.log(`  ${index}: ${url}`);
      });
    }
    
    const imageUrlsString = (favoriteInfo.imageUrls || []).join(', ');
    console.log('최종 이미지 URLs 문자열:', imageUrlsString);
    console.log('=== Apps Script 이미지 URL 디버깅 끝 ===');

    // 행 데이터 준비 (이미지URLs 필드 추가)
    const rowData = [
      orderNumber,
      new Date(),
      data.name || '',
      data.phone || '',
      data.xId || '',
      data.address || '',
      data.detailAddress || '',
      data.quantity10ml || 0,
      perfume10mlInfo,
      data.quantity50ml || 0,
      perfume50mlInfo,
      subtotal,
      shipping,
      total,
      data.additionalRequests || '',
      favoriteInfo.name || '',
      favoriteInfo.type || '',
      favoriteInfo.personality || '',
      favoriteInfo.characteristics || '',
      favoriteInfo.mood || '',
      favoriteInfo.specialMemory || '',
      favoriteInfo.desiredVibe || '',
      favoriteInfo.favoriteReason || '',
      (favoriteInfo.keywords || []).join(', '),
      (favoriteInfo.colors || []).join(', '),
      imageUrlsString // 이미지URLs 추가
    ];
    
    console.log('추가할 행 데이터:', rowData);
    
    // 데이터 추가
    sheet.appendRow(rowData);
    console.log('시트에 데이터 추가 완료');
    
    // 💡 배송 양식 처리 전에 로그 추가
    console.log('=== 배송 양식 처리 시작 ===');
    console.log('data.shippingFormat 체크:', !!data.shippingFormat);
    console.log('data.shippingFormat 길이:', data.shippingFormat ? data.shippingFormat.length : 0);
    
    // 배송 양식 데이터 저장
    if (data.shippingFormat && data.shippingFormat.length > 0) {
      console.log('배송 양식 데이터 저장 시작:', data.shippingFormat.length, '건');
      saveShippingData(data.shippingFormat);
      console.log('배송 양식 데이터 저장 완료');
    } else {
      console.log('⚠️ 배송 양식 데이터가 없어서 저장하지 않음');
    }
    
    // 이메일 알림 발송
    try {
      sendOrderNotification(data, '조향사 베이스 주문', orderNumber);
      console.log('이메일 알림 발송 완료');
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
      // 이메일 실패해도 주문은 성공으로 처리
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '주문이 성공적으로 접수되었습니다.',
        orderNumber: orderNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('조향사 주문 처리 오류:', error);
    throw new Error('조향사 주문 처리 중 오류: ' + error.message);
  }
}

/**
 * 배송 양식 데이터를 세번째 시트에 저장
 */
function saveShippingData(shippingRows) {
  try {
    console.log('💡 saveShippingData 함수 시작');
    console.log('배송 양식 저장 시작:', shippingRows.length, '건');
    console.log('배송 양식 데이터 샘플:', JSON.stringify(shippingRows[0]));
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    console.log('스프레드시트 열기 성공');
    
    // 여러 시트명 지원
    let sheet = spreadsheet.getSheetByName('배송양식') || 
                spreadsheet.getSheetByName('Shipping Information') ||
                spreadsheet.getSheetByName('shipping');
    
    console.log('기존 시트 검색 결과:', sheet ? sheet.getName() : '없음');
    
    // 시트가 없으면 '배송양식' 이름으로 생성
    if (!sheet) {
      console.log('배송양식 시트 생성 중... (이름: 배송양식)');
      sheet = spreadsheet.insertSheet('배송양식');
      console.log('시트 생성 완료');
      
      // 헤더 설정
      const headers = [
        '받는분주소(전체)', 
        '받는분주소(분할)', 
        '받는분성명', 
        '받는분전화번호', 
        '받는분기타연락처', 
        '배송메세지1', 
        '내용명', 
        '내용수량',
        '등록일시'
      ];
      
      console.log('헤더 설정 중...', headers);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      console.log('헤더 설정 완료');
      
      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      console.log('헤더 스타일링 완료');
    } else {
      console.log('기존 시트 사용:', sheet.getName());
    }
    
    // 각 배송 행을 시트에 추가
    shippingRows.forEach((row, index) => {
      console.log(`배송 데이터 ${index + 1} 저장 중:`, {
        이름: row.받는분성명,
        주소: row.받는분주소전체,
        내용명: row.내용명
      });
      
      const rowToAdd = [
        row.받는분주소전체 || '',
        row.받는분주소분할 || '',
        row.받는분성명 || '',
        row.받는분전화번호 || '',
        row.받는분기타연락처 || '',
        row.배송메세지1 || '',
        row.내용명 || '',
        row.내용수량 || 1,
        new Date() // 등록일시
      ];
      
      console.log(`실제 추가할 행 ${index + 1}:`, rowToAdd);
      sheet.appendRow(rowToAdd);
      console.log(`행 ${index + 1} 추가 완료`);
    });
    
    console.log('💡 배송 양식 저장 완료:', shippingRows.length, '건');
    
  } catch (error) {
    console.error('💥 배송 양식 저장 오류:', error);
    console.error('💥 오류 상세:', error.stack);
    throw new Error('배송 양식 저장 중 오류: ' + error.message);
  }
}

/**
 * 주문번호 생성 함수
 */
function generateOrderNumber(prefix) {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  
  return `${prefix}${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * 이메일 알림 발송 함수
 */
function sendOrderNotification(data, orderType, orderNumber) {
  try {
    console.log('이메일 알림 발송 시작');
    
    const subject = `[향수 주문] ${orderType} - ${orderNumber}`;
    
    // 향수 정보 포맷팅
    let perfumeInfo = '';
    if (data.quantity10ml > 0) {
      perfumeInfo += `10ml 향수: ${data.quantity10ml}개\n`;
    }
    if (data.quantity50ml > 0) {
      perfumeInfo += `50ml 향수: ${data.quantity50ml}개\n`;
    }
    
    // 최애 정보 포맷팅 (조향사 주문인 경우)
    let favoriteInfo = '';
    if (data.favoriteInfo) {
      favoriteInfo = `
최애 정보:
- 이름: ${data.favoriteInfo.name || ''}
- 타입: ${data.favoriteInfo.type || ''}
- 성격: ${data.favoriteInfo.personality || ''}
- 특징: ${data.favoriteInfo.characteristics || ''}
- 키워드: ${(data.favoriteInfo.keywords || []).join(', ')}
- 색상: ${(data.favoriteInfo.colors || []).join(', ')}
`;
    }
    
    const body = `
새로운 향수 주문이 접수되었습니다.

=== 주문 정보 ===
주문번호: ${orderNumber}
주문타입: ${orderType}
주문일시: ${new Date().toLocaleString('ko-KR')}

=== 고객 정보 ===
이름: ${data.name || ''}
연락처: ${data.phone || ''}
X아이디: ${data.xId || ''}
우편번호: ${data.postalCode || ''}
주소: ${data.address || ''}
상세주소: ${data.detailAddress || ''}

=== 주문 상품 ===
${perfumeInfo}

총 금액: ${data.totalAmount || 0}원
결제방법: 무통장입금

=== 배송 메모 ===
${data.additionalRequests || '없음'}

${favoriteInfo}

=== 시스템 정보 ===
접수 시간: ${new Date().toISOString()}
`;

    console.log('이메일 제목:', subject);
    console.log('이메일 수신자:', NOTIFICATION_EMAILS);
    
    // 각 이메일 주소로 개별 발송
    NOTIFICATION_EMAILS.forEach(email => {
      try {
        GmailApp.sendEmail(email, subject, body);
        console.log(`이메일 발송 성공: ${email}`);
      } catch (emailError) {
        console.error(`이메일 발송 실패 (${email}):`, emailError);
      }
    });
    
  } catch (error) {
    console.error('이메일 알림 발송 중 오류:', error);
    throw error;
  }
}

/**
 * 테스트 함수
 */
function testSetup() {
  console.log('테스트 시작');
  console.log('스프레드시트 ID:', SPREADSHEET_ID);
  console.log('알림 이메일:', NOTIFICATION_EMAILS);
  
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  console.log('스프레드시트 이름:', spreadsheet.getName());
  
  return '테스트 완료';
} 