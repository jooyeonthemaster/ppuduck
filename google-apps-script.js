/**
 * 향수 주문 관리 Apps Script
 * AI 베이스와 조향사 베이스 주문을 각각의 시트에 저장하고 이메일 알림을 전송
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
    
    console.log('파싱된 데이터:', data);
    console.log('주문 타입:', orderType);
    
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
        '주문번호', '주문일시', '이름', '연락처', '우편번호', '주소', '상세주소',
        '향수1_이름', '향수1_크기', '향수1_수량', '향수1_가격',
        '향수2_이름', '향수2_크기', '향수2_수량', '향수2_가격',
        '향수3_이름', '향수3_크기', '향수3_수량', '향수3_가격',
        '총금액', '결제방법', '배송메모'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // 주문번호 생성
    const orderNumber = generateOrderNumber('AI');
    console.log('생성된 주문번호:', orderNumber);
    
    // 향수 정보 처리
    const perfumes = data.perfumes || [];
    console.log('향수 정보:', perfumes);
    
    const perfume1 = perfumes[0] || {};
    const perfume2 = perfumes[1] || {};
    const perfume3 = perfumes[2] || {};
    
    // 행 데이터 준비
    const rowData = [
      orderNumber,
      new Date(),
      data.name || '',
      data.phone || '',
      data.zipCode || '',
      data.address || '',
      data.detailAddress || '',
      perfume1.name || '',
      perfume1.size || '',
      parseInt(perfume1.quantity) || 0,
      parseInt(perfume1.price) || 0,
      perfume2.name || '',
      perfume2.size || '',
      parseInt(perfume2.quantity) || 0,
      parseInt(perfume2.price) || 0,
      perfume3.name || '',
      perfume3.size || '',
      parseInt(perfume3.quantity) || 0,
      parseInt(perfume3.price) || 0,
      parseInt(data.totalAmount) || 0,
      data.paymentMethod || '',
      data.memo || ''
    ];
    
    console.log('추가할 행 데이터:', rowData);
    
    // 데이터 추가
    sheet.appendRow(rowData);
    console.log('시트에 데이터 추가 완료');
    
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
      // 헤더 설정
      const headers = [
        '주문번호', '주문일시', '이름', '연락처', '우편번호', '주소', '상세주소',
        '향수1_이름', '향수1_크기', '향수1_수량', '향수1_가격',
        '향수2_이름', '향수2_크기', '향수2_수량', '향수2_가격',
        '향수3_이름', '향수3_크기', '향수3_수량', '향수3_가격',
        '총금액', '결제방법', '배송메모',
        '최애_이름', '최애_타입', '최애_성격', '최애_특징', '최애_키워드', '최애_색상', '최애_이미지URL'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // 주문번호 생성
    const orderNumber = generateOrderNumber('PF');
    console.log('생성된 주문번호:', orderNumber);
    
    // 향수 정보 처리
    const perfumes = data.perfumes || [];
    console.log('향수 정보:', perfumes);
    
    const perfume1 = perfumes[0] || {};
    const perfume2 = perfumes[1] || {};
    const perfume3 = perfumes[2] || {};
    
    // 최애 정보 처리
    const favoriteInfo = data.favoriteInfo || {};
    console.log('최애 정보:', favoriteInfo);
    
    // 행 데이터 준비
    const rowData = [
      orderNumber,
      new Date(),
      data.name || '',
      data.phone || '',
      data.zipCode || '',
      data.address || '',
      data.detailAddress || '',
      perfume1.name || '',
      perfume1.size || '',
      parseInt(perfume1.quantity) || 0,
      parseInt(perfume1.price) || 0,
      perfume2.name || '',
      perfume2.size || '',
      parseInt(perfume2.quantity) || 0,
      parseInt(perfume2.price) || 0,
      perfume3.name || '',
      perfume3.size || '',
      parseInt(perfume3.quantity) || 0,
      parseInt(perfume3.price) || 0,
      parseInt(data.totalAmount) || 0,
      data.paymentMethod || '',
      data.memo || '',
      favoriteInfo.name || '',
      favoriteInfo.type || '',
      favoriteInfo.personality || '',
      favoriteInfo.characteristics || '',
      (favoriteInfo.keywords || []).join(', '),
      (favoriteInfo.colors || []).join(', '),
      favoriteInfo.imageUrl || ''
    ];
    
    console.log('추가할 행 데이터:', rowData);
    
    // 데이터 추가
    sheet.appendRow(rowData);
    console.log('시트에 데이터 추가 완료');
    
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
    if (data.perfumes && data.perfumes.length > 0) {
      perfumeInfo = data.perfumes.map((perfume, index) => 
        `${index + 1}. ${perfume.name} (${perfume.size}) - ${perfume.quantity}개 - ${perfume.price}원`
      ).join('\n');
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
우편번호: ${data.zipCode || ''}
주소: ${data.address || ''}
상세주소: ${data.detailAddress || ''}

=== 주문 상품 ===
${perfumeInfo}

총 금액: ${data.totalAmount || 0}원
결제방법: ${data.paymentMethod || ''}

=== 배송 메모 ===
${data.memo || '없음'}

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