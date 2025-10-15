# 교사키 시스템 완전 가이드

## 📋 개요

교사키는 시간 제한이 있는 콘텐츠에 조기 접근할 수 있도록 하는 기능입니다. 과학탐구실험 수행평가3(suhaeng3)에서 사용되며, 교사가 학생들에게 미리 콘텐츠를 공개할 수 있습니다.

## 🔑 교사키 사용법

### 기본 사용법
```
https://your-domain.com/science-experiments/suhaeng3/?key=TEACHER_KEY
```

### 실제 예시
```
https://physichu.netlify.app/science-experiments/suhaeng3/?key=2cde539de2474d6a8ae27529fcadb8ad
```

### 환경별 URL
- **Production**: `https://physichu.netlify.app/science-experiments/suhaeng3/?key=TEACHER_KEY`
- **Testing**: `https://test-physichu.netlify.app/science-experiments/suhaeng3-test/?key=TEACHER_KEY`

## ⚙️ 기술적 구현

### 1. 교사키 저장 메커니즘
```javascript
// URL에서 교사키 추출 및 세션 저장
(function persistTeacherKey(){
    try{
        const url = new URL(window.location.href);
        const key = url.searchParams.get('key');
        if(key){ 
            sessionStorage.setItem('teacher_key', key); 
        }
    }catch(_){}
})();
```

### 2. 독립적 교사키 검증 (v1.3.0 개선)
```javascript
// 교사키를 시간 함수와 무관하게 먼저 검증
const teacherKey = sessionStorage.getItem('teacher_key') || '';
const hasValidTeacherKey = teacherKey && teacherKey.trim().length > 0;

if (hasValidTeacherKey) {
    // 교사키가 있으면 즉시 콘텐츠 해제
    console.log('Teacher key found:', teacherKey.slice(0, 8) + '...');
    
    // 세션 버튼 표시
    if (s1Link) s1Link.classList.remove('hidden');
    if (s2Link) s2Link.classList.remove('hidden');
    
    // 링크에 교사키 추가
    [s1Link, s2Link].forEach(link => {
        if (!link) return;
        const url = new URL(link.getAttribute('href'), window.location.origin);
        url.searchParams.set('key', teacherKey);
        link.setAttribute('href', url.pathname + url.search);
    });
    
    return; // 조기 종료
}
```

### 3. 시간 기반 잠금 해제 (교사키 없을 때만)
```javascript
// 교사키가 없을 때만 시간 기반 검증
try {
    const response = await fetch('/.netlify/functions/time', { cache: 'no-store' });
    const data = await response.json();
    const nowUTC = Date.parse(data.now);
    const SHOW_UTC = Date.parse('2025-10-13T00:00:00Z');
    
    if (nowUTC >= SHOW_UTC) {
        // 시간 기반 해제
        if (s1Link) s1Link.classList.remove('hidden');
        if (s2Link) s2Link.classList.remove('hidden');
    }
} catch (error) {
    console.error('Time function failed:', error);
    // 시간 함수 실패 시에도 교사키는 이미 처리됨
}
```

## 🔧 최근 개선사항 (v1.3.0)

### 🚨 이전 문제점
1. **시간 함수 의존성**: 교사키 검증이 시간 함수 호출에 의존
2. **오류 처리 방식**: 시간 함수가 실패하면 교사키도 무시됨
3. **로직 순서**: 교사키 검증이 시간 함수 호출 후에 실행됨

### ✅ 해결된 문제
1. **독립적 검증**: 교사키를 시간 함수와 무관하게 먼저 검증
2. **즉시 해제**: 교사키가 있으면 시간 함수 호출 없이 바로 해제
3. **안정성 향상**: 시간 함수 실패해도 교사키는 정상 작동
4. **디버깅 지원**: 콘솔에서 교사키 상태 확인 가능

## 🧪 테스트 방법

### 1. 교사키 기능 테스트
```bash
# 교사키 포함 URL로 접속
https://physichu.netlify.app/science-experiments/suhaeng3/?key=2cde539de2474d6a8ae27529fcadb8ad

# 예상 결과:
✅ 즉시 세션1, 세션2 버튼 표시
✅ 콘솔 로그: "Teacher key found: 2cde539..."
✅ 세션 링크에 교사키 자동 추가
```

### 2. 교사키 없이 테스트
```bash
# 일반 URL로 접속
https://physichu.netlify.app/science-experiments/suhaeng3/

# 예상 결과:
✅ "활동 버튼은 10/13 00:00 공개 예정" 메시지 표시
✅ 세션1, 세션2 버튼 숨김 상태
```

### 3. 새로고침 테스트
```bash
# 교사키 URL로 접속 후 새로고침 (F5)
# 예상 결과:
✅ 교사키가 유지되어 버튼 계속 표시
✅ 세션 링크에 교사키 유지
```

### 4. 브라우저 호환성 테스트
- [ ] **Chrome**: 모든 기능 정상 작동
- [ ] **Safari**: 모든 기능 정상 작동
- [ ] **Firefox**: 모든 기능 정상 작동
- [ ] **Edge**: 모든 기능 정상 작동
- [ ] **모바일 브라우저**: 터치 인터페이스 정상

## 🔍 디버깅 가이드

### 콘솔 로그 확인
```javascript
// 교사키 발견 시
console.log('Teacher key found:', teacherKey.slice(0, 8) + '...');

// 시간 함수 실패 시
console.error('Time function failed:', error);
```

### 브라우저 개발자 도구 활용
1. **F12**로 개발자 도구 열기
2. **Console 탭**에서 로그 확인
3. **Application 탭** → **Session Storage**에서 교사키 확인
4. **Network 탭**에서 시간 함수 호출 상태 확인

### 문제 진단 체크리스트
- [ ] URL에 `?key=` 파라미터가 있는지 확인
- [ ] Session Storage에 `teacher_key`가 저장되었는지 확인
- [ ] 콘솔에 "Teacher key found" 로그가 있는지 확인
- [ ] 세션 링크에 교사키가 추가되었는지 확인

## 🚨 보안 고려사항

### 현재 상태
- ⚠️ **검증 부재**: 모든 교사키 값이 유효함 (검증 로직 없음)
- ⚠️ **노출 위험**: URL에 교사키가 노출됨
- ⚠️ **세션 저장**: 브라우저 세션에 평문 저장

### 향후 개선 방향
```javascript
// 1. 교사키 검증 강화
const VALID_TEACHER_KEYS = [
    '2cde539de2474d6a8ae27529fcadb8ad',
    'another_valid_key_here'
];
const isValidTeacherKey = VALID_TEACHER_KEYS.includes(teacherKey);

// 2. 교사키 만료 시간 설정
const TEACHER_KEY_EXPIRY = Date.parse('2025-12-31T23:59:59Z');
const isExpired = Date.now() > TEACHER_KEY_EXPIRY;

// 3. 사용 이력 추적
const logTeacherKeyUsage = (key, action) => {
    console.log(`Teacher key ${key.slice(0, 8)}... used for ${action}`);
};
```

## 📊 기능 비교

### v1.2.0 (이전 버전)
```javascript
// 문제가 있던 코드
try {
    const res = await fetch('/.netlify/functions/time');
    const teacherKey = sessionStorage.getItem('teacher_key') || '';
    const unlock = teacherKey || nowUTC >= SHOW_UTC;
} catch (_) {
    // 시간 함수 실패 시 교사키도 무시됨
    if (s1Link) s1Link.classList.add('hidden');
}
```

### v1.3.0 (현재 버전)
```javascript
// 개선된 코드
const teacherKey = sessionStorage.getItem('teacher_key') || '';
const hasValidTeacherKey = teacherKey && teacherKey.trim().length > 0;

if (hasValidTeacherKey) {
    // 교사키가 있으면 즉시 해제 (시간 함수와 무관)
    console.log('Teacher key found:', teacherKey.slice(0, 8) + '...');
    // 버튼 표시 및 링크에 교사키 추가
    return; // 조기 종료
}

// 교사키가 없을 때만 시간 기반 검증
try {
    const res = await fetch('/.netlify/functions/time');
    // 시간 기반 잠금 해제 로직
} catch (error) {
    console.error('Time function failed:', error);
    // 시간 함수 실패해도 교사키는 이미 처리됨
}
```

## 🎯 사용 시나리오

### 교사용 시나리오
1. **조기 공개**: 학생들에게 미리 콘텐츠 공개
2. **테스트 목적**: 시스템 테스트 및 검증
3. **특별 상황**: 긴급한 상황에서 조기 접근

### 학생용 시나리오
1. **정상 접근**: 공개 시간(10/13 00:00) 이후 접근
2. **교사 안내**: 교사가 제공한 교사키로 조기 접근
3. **세션 이동**: 교사키가 포함된 세션 링크로 이동

## 📚 관련 문서

### 사용자 가이드
- [과학탐구실험 완전 가이드](suhaeng3-complete-guide.md)
- [테스트 완전 가이드](testing-complete-guide.md)

### 개발자 문서
- [API 문서](../project/api.md)
- [배포 가이드](../project/deployment.md)
- [문제 해결 가이드](PLAYWRIGHT_TROUBLESHOOTING.md)

## 🔄 최신 업데이트

### v1.3.0 (2025-10-15)
- ✅ 교사키 독립적 검증 구현
- ✅ 시간 함수 실패 시에도 교사키 정상 작동
- ✅ 디버깅 로그 추가
- ✅ 안정성 대폭 향상

### v1.2.0 (2025-08-30)
- ✅ 교사키 기본 기능 구현
- ✅ 세션 저장 및 링크 전달
- ✅ URL 파라미터 방식 도입

---

**마지막 업데이트**: 2025-10-15  
**버전**: 1.3.0  
**상태**: 운영 중

