// preview.js - 입력 -> 미리보기 자동 바인딩 (간단판)
export function autoBindPreview({ map }) {
  Object.entries(map).forEach(([inputId, previewId]) => {
    const inputEl = document.getElementById(inputId);
    const prevEl = document.getElementById(previewId);
    if(!inputEl || !prevEl) return;
    const update = () => {
      const v = inputEl.value.trim();
      if(v){
        prevEl.textContent = v;
      } else {
        prevEl.innerHTML = '<span class="preview-placeholder">내용을 입력하세요...</span>';
      }
    };
    inputEl.addEventListener('input', update);
    update();
  });
}
