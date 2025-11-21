# 교사키 기능 가이드

## 📋 개요

교사키는 시간 제한이 있는 콘텐츠에 조기 접근할 수 있도록 하는 기능입니다. suhaeng3 프로젝트에서 사용되며, 교사가 학생들에게 미리 콘텐츠를 공개할 수 있습니다.

## 🔑 교사키 사용법

### URL 파라미터 방식
```
https://your-domain.com/science-experiments/suhaeng3/?key=TEACHER_KEY
```

### 예시
```
https://physichu.netlify.app/science-experiments/suhaeng3/?key=2cde539de2474d6a8ae27529fcadb8ad
```

## ⚙️ 기술적 구현

### 1. 교사키 저장
```javascript
// URL에서 교사키 추출 및 저장
(function persistTeacherKey(){
    try{
        const u=new URL(window.location.href);
        const k=u.searchParams.get('key');
        if(k){ sessionStorage.setItem('teacher_key', k); }
    }catch(_){}
})();
```

### 2. 교사키 검증
```javascript
// 교사키 우선 검증 (시간 함수와 독립적)
const teacherKey = sessionStorage.getItem('teacher_key') || '';
const hasValidTeacherKey = teacherKey && teacherKey.trim().length > 0;

if (hasValidTeacherKey) {
    // 즉시 콘텐츠 해제
    console.log('Teacher key found:', teacherKey.slice(0, 8) + '...');
    // 버튼 표시 및 링크에 교사키 추가
    return; // 조기 종료
}
```

### 3. 링크 전달
```javascript
// 세션 링크에 교사키 추가
[s1Link, s2Link].forEach(a => {
    if (!a) return; 
    const url = new URL(a.getAttribute('href'), window.location.origin); 
    url.searchParams.set('key', teacherKey); 
    a.setAttribute('href', url.pathname + url.search);
});
```

## 🔧 최근 개선사항 (2025-10-02)

### 문제점
- 교사키 검증이 시간 함수(`/.netlify/functions/time`) 호출에 의존
- 시간 함수 실패 시 교사키도 무시됨
- 교사키 검증이 시간 함수 호출 후에 실행됨

### 해결책
1. **독립적 검증**: 교사키를 시간 함수와 무관하게 먼저 검증
2. **즉시 해제**: 교사키가 있으면 시간 함수 호출 없이 바로 해제
3. **안정성 향상**: 시간 함수 실패해도 교사키는 정상 작동
4. **디버깅 지원**: 콘솔에서 교사키 상태 확인 가능

## 🧪 테스트 방법

### 1. 교사키 테스트
```
https://your-domain.com/science-experiments/suhaeng3/?key=2cde539de2474d6a8ae27529fcadb8ad
```
- **예상 결과**: 즉시 세션1, 세션2 버튼 표시
- **콘솔 로그**: "Teacher key found: 2cde539..."

### 2. 교사키 없이 테스트
```
https://your-domain.com/science-experiments/suhaeng3/
```
- **예상 결과**: "활동 버튼은 10/13 00:00 공개 예정" 메시지 표시

### 3. 새로고침 테스트
- 교사키 URL로 접속 후 새로고침
- **예상 결과**: 교사키 유지되어 버튼 계속 표시

## 🔍 디버깅

### 콘솔 로그 확인
```javascript
// 교사키 발견 시
console.log('Teacher key found:', teacherKey.slice(0, 8) + '...');

// 시간 함수 실패 시
console.error('Time function failed:', error);
```

### 브라우저 개발자 도구
1. F12로 개발자 도구 열기
2. Console 탭에서 로그 확인
3. Application 탭에서 sessionStorage 확인

## 🚨 주의사항

### 보안 고려사항
- 현재는 모든 교사키 값이 유효함 (검증 로직 없음)
- 교사키는 브라우저 세션에 저장됨
- URL에 교사키가 노출됨

### 향후 개선 방향
1. **교사키 검증**: 유효한 교사키 목록 관리
2. **만료 시간**: 교사키 만료 시간 설정
3. **암호화**: 교사키 암호화 저장
4. **로그 관리**: 교사키 사용 이력 추적

## 📚 관련 문서

- [suhaeng3 사용자 가이드](suhaeng3-user-guide.md)
- [suhaeng3 테스트 가이드](suhaeng3-test-guide.md)
- [API 문서](api/README.md)
- [배포 가이드](deployment/README.md)
