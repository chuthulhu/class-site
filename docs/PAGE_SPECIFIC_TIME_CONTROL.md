# 페이지별 시간 제어 시스템

## 🎯 개요

각 페이지마다 다른 시간 설정을 할 수 있는 유연한 시스템입니다. `time.js` 함수를 기반으로 페이지별로 독립적인 시간 제어가 가능합니다.

## 📋 페이지별 설정

### **현재 설정된 페이지들**

#### **1. 수행평가3 허브 페이지**
- **페이지**: `suhaeng3/index.html`
- **활성화 시간**: 2025-10-12 00:00 KST
- **설명**: 수행평가3 허브 페이지

#### **2. 수행평가3 1차시**
- **페이지**: `suhaeng3/session1.html`
- **활성화 시간**: 2025-10-12 00:00 KST
- **설명**: 수행평가3 1차시

#### **3. 수행평가3 2차시**
- **페이지**: `suhaeng3/session2.html`
- **활성화 시간**: 2025-10-13 00:00 KST (1일 후)
- **설명**: 수행평가3 2차시

#### **4. 기본 설정**
- **페이지**: 기타 모든 페이지
- **활성화 시간**: 2025-10-12 00:00 KST
- **설명**: 기본 설정

## 🔧 새로운 페이지 추가하기

### **time.js에 페이지 설정 추가**

```javascript
const pageConfigs = {
  'suhaeng3-index': {
    releaseTime: '2025-10-12 00:00 KST',
    description: '수행평가3 허브 페이지'
  },
  'new-page': {
    releaseTime: '2025-10-15 09:00 KST',
    description: '새로운 페이지'
  },
  'special-page': {
    releaseTime: '2025-10-14 09:00,2025-10-14 17:00 KST',
    description: '특정 시간대만 활성화'
  }
};
```

### **클라이언트에서 페이지 타입 감지**

```javascript
// 클라이언트 코드에 추가
if (currentPath.includes('new-page.html')) {
    pageType = 'new-page';
} else if (currentPath.includes('special-page.html')) {
    pageType = 'special-page';
}
```

## 🚀 사용 방법

### **1. 자동 페이지 감지**
- URL 경로를 기반으로 자동으로 페이지 타입 감지
- 각 페이지마다 다른 시간 설정 적용

### **2. URL 파라미터로 테스트**
```
# 특정 페이지 타입으로 테스트
?page=suhaeng3-session2&release_time=+0h

# 시간 범위로 테스트
?page=suhaeng3-index&release_time=2025-01-15 09:00,2025-01-15 17:00 KST
```

### **3. 서버 응답 확인**
```json
{
  "now": 1737027000000,
  "iso": "2025-01-15T10:30:00.000Z",
  "timezone": "UTC",
  "page": "suhaeng3-session2",
  "config": {
    "releaseTime": "2025-10-13 00:00 KST",
    "description": "수행평가3 2차시"
  },
  "timeControl": {
    "releaseTime": 1728759600000,
    "releaseTimeISO": "2025-10-12T15:00:00.000Z",
    "isReleased": true,
    "hoursUntilRelease": 0,
    "type": "single"
  }
}
```

## 📊 콘솔에서 확인

### **브라우저 콘솔 출력**
```javascript
Checking time-based control...
Using server time function for page: suhaeng3-session2
📄 페이지 설정: 수행평가3 2차시
🎯 페이지 타입: suhaeng3-session2
=== 시간 제어 상태 ===
상태: 활성화됨 (2025-10-13부터)
변경까지 남은 시간: 0 시간
```

## 🎯 실제 사용 예시

### **단계별 공개**
```javascript
// 1차시: 10월 12일
'suhaeng3-session1': {
  releaseTime: '2025-10-12 00:00 KST'
}

// 2차시: 10월 13일 (1일 후)
'suhaeng3-session2': {
  releaseTime: '2025-10-13 00:00 KST'
}

// 최종 제출: 10월 15일 (3일 후)
'suhaeng3-final': {
  releaseTime: '2025-10-15 00:00 KST'
}
```

### **시간대별 제한**
```javascript
// 업무시간만 활성화
'work-hours-only': {
  releaseTime: '2025-10-12 09:00,2025-10-12 17:00 KST'
}

// 주말 비활성화
'weekdays-only': {
  releaseTime: '2025-10-13 00:00,2025-10-17 23:59 KST'
}
```

## 💡 장점

1. **페이지별 독립성**: 각 페이지마다 다른 시간 설정
2. **유연성**: 시간 범위, 단일 시간 모두 지원
3. **확장성**: 새로운 페이지 쉽게 추가 가능
4. **디버깅**: 페이지별 설정 정보 콘솔 출력
5. **테스트**: URL 파라미터로 즉시 테스트 가능

## 🔧 관리 방법

### **시간 변경**
1. `time.js`의 `pageConfigs` 수정
2. 배포 후 자동 적용

### **새 페이지 추가**
1. `pageConfigs`에 새 설정 추가
2. 클라이언트 코드에 페이지 감지 로직 추가
3. 배포 후 적용

이제 각 페이지마다 완전히 독립적인 시간 제어가 가능합니다! 🚀
