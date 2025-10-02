// testing/src/science-experiments/suhaeng3-test/modules/session2-app.js
// 2차시 세션 전용 앱 모듈

import { ProgressManager, ToastManager, ModalManager, StatusManager, EnvironmentDetector } from './ui-utils.js';
import { FileProcessor, FilenameGenerator, DocumentGenerator, DownloadManager } from './file-utils.js';
import { UploadManager } from './upload-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 모듈 인스턴스 생성 ---
    const progressManager = new ProgressManager();
    const toastManager = new ToastManager();
    const modalManager = new ModalManager();
    const statusManager = new StatusManager();
    const downloadManager = new DownloadManager(progressManager, toastManager, statusManager);
    const uploadManager = new UploadManager(progressManager, toastManager, statusManager, downloadManager);

    // --- DOM Element Constants ---
    const dom = {
        tabs: document.querySelectorAll('.tab-button'),
        tabContents: document.querySelectorAll('.tab-content'),
        accordions: document.querySelectorAll('.accordion-header button'),
        downloadZipBtn: document.getElementById('download_zip_btn'),
        printBtn: document.getElementById('print_btn'),
        previewNewTabBtn: document.getElementById('preview_newtab_btn'),
        retryUploadBtn: document.getElementById('retry_upload_btn'),
        addSourceBtn: document.getElementById('add_source_btn'),
        sourcesContainer: document.getElementById('sources_container'),
        clearInputsBtn: document.getElementById('clear_inputs_btn'),
        toast: document.getElementById('toast-notification'),
        allInputs: document.querySelectorAll('#tab4 input, #tab4 textarea, input#student_grade, input#student_class, input#student_number, input#student_name'),
        submitStatus: document.getElementById('submit_status'),
    };

    // --- 탭 기능 정의 ---
    function initTabs() {
        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                
                // 모든 탭 버튼에서 active 클래스 제거
                tabs.forEach(b => b.classList.remove('active'));
                // 클릭된 버튼에 active 클래스 추가
                btn.classList.add('active');
                
                // 모든 탭 콘텐츠에서 active 클래스 제거
                contents.forEach(c => c.classList.remove('active'));
                // 해당하는 콘텐츠에 active 클래스 추가
                const targetContent = document.getElementById(target);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // 페이지 상단으로 스크롤
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
    
    // --- 아코디언 기능 정의 ---
    function initAccordions() {
        const accordionButtons = document.querySelectorAll('.accordion-header button');
        
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const content = button.nextElementSibling;
                const isOpen = content.classList.contains('open');
                
                // 모든 아코디언 닫기
                accordionButtons.forEach(btn => {
                    btn.classList.remove('open');
                    btn.nextElementSibling.classList.remove('open');
                });
                
                // 클릭된 아코디언이 닫혀있었다면 열기
                if (!isOpen) {
                    button.classList.add('open');
                    content.classList.add('open');
                }
            });
        });
    }

    // --- 이벤트 리스너 설정 ---
    if (dom.downloadZipBtn) dom.downloadZipBtn.addEventListener('click', () => uploadManager.handleZipDownloadAndSubmit());
    if (dom.printBtn) dom.printBtn.addEventListener('click', printReport);
    if (dom.previewNewTabBtn) dom.previewNewTabBtn.addEventListener('click', openPreviewInNewTab);
    if (dom.retryUploadBtn) dom.retryUploadBtn.addEventListener('click', () => uploadManager.retryLastUpload());
    if (dom.clearInputsBtn) dom.clearInputsBtn.addEventListener('click', clearAllInputs);
    if (dom.addSourceBtn) dom.addSourceBtn.addEventListener('click', addSourceElement);

    // --- 기존 함수들 ---
    function printReport() { 
        const originalTitle = document.title; 
        document.title = FilenameGenerator.getReportFilename(); 
        window.print(); 
        setTimeout(() => { document.title = originalTitle; }, 500); 
    }

    function openPreviewInNewTab() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const docHtml = DocumentGenerator.generateDocHtml(FilenameGenerator.getReportFilename(), reportContent);
        const newWindow = window.open('', '_blank');
        newWindow.document.write(docHtml);
        newWindow.document.close();
    }

    function clearAllInputs() {
        if (confirm('모든 입력 내용을 삭제하시겠습니까?')) {
            dom.allInputs.forEach(input => input.value = '');
            dom.sourcesContainer.innerHTML = '';
            updatePreviewAndSave();
            toastManager.show('모든 입력 내용이 삭제되었습니다.');
        }
    }

    function addSourceElement(sourceData = null) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'source-entry border p-4 rounded-md bg-gray-50 space-y-3';
        
        const sourceId = `source_${Date.now()}`;
        entryDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <label class="font-semibold text-gray-700">출처 정보</label>
                <button type="button" class="text-red-600 hover:text-red-800 text-sm" onclick="this.closest('.source-entry').remove(); updatePreviewAndSave();">삭제</button>
            </div>
            <input type="text" placeholder="출처 제목 (예: 뉴스 기사 제목)" class="w-full p-2 border border-gray-300 rounded-md source-title">
            <input type="url" placeholder="URL (선택사항)" class="w-full p-2 border border-gray-300 rounded-md source-url">
        `;
        
        dom.sourcesContainer.appendChild(entryDiv);
        
        // 입력 이벤트 리스너 추가
        entryDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updatePreviewAndSave);
        });
        
        updatePreviewAndSave();
    }

    function updatePreviewAndSave() {
        // 학생 정보 업데이트
        const grade = document.getElementById('student_grade').value || '1';
        const studentClass = document.getElementById('student_class').value || '0';
        const studentNumber = document.getElementById('student_number').value || '00';
        const studentName = document.getElementById('student_name').value || 'ㅇㅇㅇ';
        
        document.getElementById('preview_student_grade').textContent = grade;
        document.getElementById('preview_student_class').textContent = studentClass;
        document.getElementById('preview_student_number').textContent = studentNumber;
        document.getElementById('preview_student_name').textContent = studentName;

        // 아이디어 업데이트
        const ideaInfra = document.getElementById('field_idea_infra').value;
        const ideaPolicy = document.getElementById('field_idea_policy').value;
        const ideaOperation = document.getElementById('field_idea_operation').value;
        
        const infraPreview = document.getElementById('preview_idea_infra');
        const policyPreview = document.getElementById('preview_idea_policy');
        const operationPreview = document.getElementById('preview_idea_operation');
        
        infraPreview.innerHTML = ideaInfra.trim() ? ideaInfra.replace(/\n/g, '<br>') : '<span class="preview-placeholder">내용을 입력하세요...</span>';
        policyPreview.innerHTML = ideaPolicy.trim() ? ideaPolicy.replace(/\n/g, '<br>') : '<span class="preview-placeholder">내용을 입력하세요...</span>';
        operationPreview.innerHTML = ideaOperation.trim() ? ideaOperation.replace(/\n/g, '<br>') : '<span class="preview-placeholder">내용을 입력하세요...</span>';

        // 기대 효과 업데이트
        const effects = document.getElementById('field_effects').value;
        const effectsPreview = document.getElementById('preview_effects');
        if (effects.trim()) {
            effectsPreview.innerHTML = effects.replace(/\n/g, '<br>');
        } else {
            effectsPreview.innerHTML = '<span class="preview-placeholder">내용을 입력하세요...</span>';
        }

        // 출처 업데이트
        const sources = Array.from(document.querySelectorAll('.source-entry')).map(entry => {
            const title = entry.querySelector('.source-title').value.trim();
            const url = entry.querySelector('.source-url').value.trim();
            if (title) {
                return url ? `<a href="${url}" target="_blank">${title}</a>` : title;
            }
            return null;
        }).filter(Boolean);
        
        const sourcesPreview = document.getElementById('preview_sources');
        if (sources.length > 0) {
            sourcesPreview.innerHTML = sources.map(source => `<div class="preview-text">${source}</div>`).join('');
        } else {
            sourcesPreview.innerHTML = '<span class="preview-placeholder">내용을 입력하세요...</span>';
        }

        // 데이터 저장
        const data = {
            student_grade: grade,
            student_class: studentClass,
            student_number: studentNumber,
            student_name: studentName,
            field_idea_infra: ideaInfra,
            field_idea_policy: ideaPolicy,
            field_idea_operation: ideaOperation,
            field_effects: effects,
            sources: Array.from(document.querySelectorAll('.source-entry')).map(entry => ({
                title: entry.querySelector('.source-title').value.trim(),
                url: entry.querySelector('.source-url').value.trim()
            }))
        };
        
        localStorage.setItem('session2_data', JSON.stringify(data));
    }

    // --- 초기화 ---
    initTabs();
    initAccordions();
    
    // 모든 입력 필드에 이벤트 리스너 추가
    dom.allInputs.forEach(input => {
        input.addEventListener('input', updatePreviewAndSave);
    });

    // 저장된 데이터 로드
    const savedData = localStorage.getItem('session2_data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'sources' && Array.isArray(value)) {
                    value.forEach(source => addSourceElement(source));
                } else {
                    const el = document.getElementById(key);
                    if (el) el.value = value;
                }
            });
        } catch (error) {
            console.error('저장된 데이터 로드 실패:', error);
        }
    }

    // 초기 미리보기 업데이트
    updatePreviewAndSave();
});
