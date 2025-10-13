// hub-config.js - Hub 페이지 공용 설정
export const UNLOCK_AT = '2025-10-12T15:00:00Z'; // KST 10/13 00:00
export const STORAGE_KEY_MAIN = 'firstLastMileProjectData';
export const SUBMIT_META_KEY = 'submit_meta';
export const SUBMISSION_ENDPOINT = '/.netlify/functions/submit';
export const SUBMISSION_KEY_HEADER = 'X-Submission-Key';
export const SUBMISSION_KEY_VALUE = 'S-2025-github2025subject';
export const MAX_ZIP_BYTES = 8 * 1024 * 1024; // 8MB

// 출처 타입 설정 (원본 유지)
export const SOURCE_TYPES = {
  '논문': {'저자':true, '연도':true, '논문 제목':true, '학술지명':false, '권':false, '호':false, '페이지':false},
  '도서': {'저자':true, '도서명':true, '출판사':true, '연도':false},
  '학술잡지': {'잡지명':true, '기사 제목':true, '기자명':true, '발행일':false},
  '인터넷 URL': {'웹사이트명':true, '글 제목':true, '작성자(기자)':true, 'URL':true}
};

export const FIELD_PREVIEW_MAP = {
  'student_grade': 'preview_student_grade',
  'student_class': 'preview_student_class',
  'student_number': 'preview_student_number',
  'student_name': 'preview_student_name',
  'field_analysis': 'preview_analysis',
  'field_c1_title': 'preview_c1_title','field_c1_desc': 'preview_c1_desc',
  'field_c2_title': 'preview_c2_title','field_c2_desc': 'preview_c2_desc',
  'field_idea_infra': 'preview_idea_infra', 'field_idea_policy': 'preview_idea_policy',
  'field_idea_operation': 'preview_idea_operation',
  'field_effects': 'preview_effects'
};
