// 업로드 관리 모듈
// 파일 업로드, 재시도, 검증 등 업로드 관련 기능

export class UploadManager {
    constructor(progressManager, toastManager, statusManager, downloadManager) {
        this.progressManager = progressManager;
        this.toastManager = toastManager;
        this.statusManager = statusManager;
        this.downloadManager = downloadManager;
        
        // Constants & Config
        this.ENDPOINT = '/.netlify/functions/submit_test';
        this.SUBMIT_KEY = 'S-2025-github2025subject'; // TODO: 환경변수로 이동 필요
        this.SUBJECT = document.querySelector('meta[name="submission-subject"]')?.content || '과학탐구실험2';
        this.ASSIGNMENT = 'suhaeng3';
        this.SUBMIT_META_KEY = 'submit_meta';
        
        this.lastZipBlob = null;
        this.lastMeta = null;
    }

    setLastZip(zipBlob, meta) {
        this.lastZipBlob = zipBlob;
        this.lastMeta = meta;
        this.downloadManager.setLastZip(zipBlob, meta);
    }

    validateForm() {
        const gradeEl = document.getElementById('student_grade');
        const classEl = document.getElementById('student_class');
        const numberEl = document.getElementById('student_number');
        const nameEl = document.getElementById('student_name');
        const grade = parseInt((gradeEl.value || '').trim(), 10);
        const klass = parseInt((classEl.value || '').trim(), 10);
        const number = parseInt((numberEl.value || '').trim(), 10);
        const name = (nameEl.value || '').trim();

        if (Number.isNaN(grade) || grade < 1 || grade > 3) {
            this.toastManager.show('학년은 1~3 사이의 숫자여야 합니다.', 'bg-red-500');
            this.statusManager.setStatus('검증 실패: 학년 범위를 확인하세요.');
            gradeEl.focus();
            return null;
        }
        if (Number.isNaN(klass) || klass < 1 || klass > 20) {
            this.toastManager.show('반은 1~20 사이의 숫자여야 합니다.', 'bg-red-500');
            this.statusManager.setStatus('검증 실패: 반 범위를 확인하세요.');
            classEl.focus();
            return null;
        }
        if (Number.isNaN(number) || number < 1 || number > 40) {
            this.toastManager.show('번호는 1~40 사이의 숫자여야 합니다.', 'bg-red-500');
            this.statusManager.setStatus('검증 실패: 번호 범위를 확인하세요.');
            numberEl.focus();
            return null;
        }
        if (!name) {
            this.toastManager.show('이름을 입력하세요.', 'bg-red-500');
            this.statusManager.setStatus('검증 실패: 이름이 필요합니다.');
            nameEl.focus();
            return null;
        }

        return { grade, klass, number, name };
    }

    disableSubmitUI(disabled) {
        const downloadZipBtn = document.getElementById('download_zip_btn');
        const printBtn = document.getElementById('print_btn');
        const previewNewTabBtn = document.getElementById('preview_newtab_btn');
        const retryUploadBtn = document.getElementById('retry_upload_btn');
        
        if (downloadZipBtn) downloadZipBtn.disabled = disabled;
        if (printBtn) printBtn.disabled = disabled;
        if (previewNewTabBtn) previewNewTabBtn.disabled = disabled;
        if (retryUploadBtn) retryUploadBtn.classList.toggle('hidden', disabled || !retryUploadBtn.dataset.show);
    }

    async fetchWithTimeout(url, timeoutMs, options) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...(options||{}), signal: controller.signal });
        } finally {
            clearTimeout(id);
        }
    }

    async handleZipDownloadAndSubmit() {
        try {
            this.statusManager.setStatus('학생 정보 검증 중…');
            const retryUploadBtn = document.getElementById('retry_upload_btn');
            if (retryUploadBtn) {
                retryUploadBtn.dataset.show = '';
                retryUploadBtn.classList.add('hidden');
            }
            
            const form = this.validateForm();
            if (!form) return;

            this.disableSubmitUI(true);
            this.progressManager.show(true);
            this.progressManager.setProgress(10, '문서 생성 준비...');
            this.progressManager.setDetails(1, 6, '학생 정보 검증');

            // Build filenames & meta
            const section = this.calcSectionCode(form.grade, form.klass);
            const studentId = this.calcStudentId(form.grade, form.klass, form.number);
            const docTitle = this.getDocTitle();
            
            // Use KST (Asia/Seoul) time with Intl for filenames
            const fmt = new Intl.DateTimeFormat('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
            const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
            const timestamp = `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
            const baseName = `${studentId}_${form.name}_${docTitle}_${timestamp}`;
            const htmlFilename = `${baseName}.html`;
            const zipFilename = `${baseName}.zip`;

            // Generate doc HTML
            this.statusManager.setStatus('ZIP 파일 생성 중…');
            this.progressManager.setProgress(25, 'ZIP 생성 중...');
            this.progressManager.setDetails(2, 6, 'HTML 문서 생성');
            const reportContent = document.getElementById('report-content').innerHTML;
            const docHtml = this.generateDocHtml(baseName, reportContent);

            // Build ZIP
            const zip = new JSZip();
            zip.file(htmlFilename, docHtml);
            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
            this.setLastZip(zipBlob, { studentId, name: form.name, zipFilename, section });

            // Size validation (8MB limit) BEFORE base64 to save CPU/mem
            const sizeBytes = zipBlob.size;
            if (sizeBytes > 8 * 1024 * 1024) {
                this.statusManager.setStatus('업로드 실패: ZIP 용량 초과 (8MB)');
                this.toastManager.show('ZIP 파일 용량이 8MB를 초과합니다. 내용을 간소화해주세요.', 'bg-red-500');
                const retryBtn = document.getElementById('retry_upload_btn');
                if (retryBtn) {
                    retryBtn.dataset.show = '1';
                    retryBtn.classList.remove('hidden');
                }
                return;
            }

            // Convert to base64 for upload (only after size check)
            this.statusManager.setStatus('저장준비중입니다. 잠시 기다려 주세요');
            this.progressManager.setProgress(45, '업로드 준비...');
            this.progressManager.setDetails(3, 6, zipFilename, zipBlob.size);
            const b64 = await this.blobToBase64(zipBlob);

            // File extension validation
            if (!zipFilename.toLowerCase().endsWith('.zip')) {
                this.statusManager.setStatus('업로드 실패: 지원하지 않는 파일 형식');
                this.toastManager.show('ZIP 파일만 업로드할 수 있습니다.', 'bg-red-500');
                return;
            }

            // Prepare payload in submit.js compatible format (multi-file array)
            this.statusManager.setStatus('저장준비중입니다. 잠시 기다려 주세요');
            const payload = {
                studentId: studentId,
                subject: this.SUBJECT,
                section: section,
                files: [{
                    filename: zipFilename,
                    contentBase64: b64,
                    mime: 'application/zip'
                }]
            };

            // Upload with retry logic
            let uploadAttempts = 0;
            const maxAttempts = 3;

            while (uploadAttempts < maxAttempts) {
                try {
                    uploadAttempts++;
                    if (uploadAttempts > 1) {
                        this.statusManager.setStatus(`저장준비중입니다. 잠시 기다려 주세요`);
                        this.progressManager.setProgress(60, '업로드 재시도 중...');
                        await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts)); // Exponential backoff
                    }

                    this.progressManager.setProgress(60, '업로드 중...');
                    this.progressManager.setDetails(4, 6, '서버 업로드', zipBlob.size);
                    const res = await this.fetchWithTimeout(this.ENDPOINT, 20000, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Submission-Key': this.SUBMIT_KEY,
                        },
                        body: JSON.stringify(payload),
                    });

                    const text = await res.text();
                    let data = {};
                    try {
                        data = JSON.parse(text);
                    } catch (_) {
                        data = { raw: text };
                    }

                    if (!res.ok) {
                        const errorMsg = data.error || data.detail || data.message || res.statusText || `HTTP ${res.status}`;
                        if (uploadAttempts < maxAttempts && (res.status === 429 || res.status >= 500)) {
                            // Retry on rate limit or server errors
                            continue;
                        }
                        throw new Error(`업로드 실패: ${errorMsg}`);
                    }

                    // Success: upload completed, then start local download
                    const uploadedFile = data.files?.[0];
                    const filePath = uploadedFile?.name || zipFilename;
                    const fullPath = `/과제제출/${this.SUBJECT}/${section}/${studentId}/${filePath}`;

                    // Success: try local download first, verify, then fallback if needed
                    this.statusManager.setStatus(`✅ 제출 완료! 저장 경로: ${fullPath} — 다운로드 확인 중…`);
                    this.progressManager.setProgress(85, '다운로드 준비...');
                    this.progressManager.setDetails(5, 6, '다운로드 준비');
                    this.downloadManager.attemptLocalDownloadAndVerify(zipFilename);
                    this.progressManager.setProgress(100, '완료');
                    this.progressManager.setDetails(6, 6, '모든 작업 완료');
                    setTimeout(() => this.progressManager.show(false), 1500);

                    this.toastManager.show(`제출이 완료되었습니다! 파일: ${filePath}`, 'bg-green-600');

                    // Clear retry button
                    const retryBtn = document.getElementById('retry_upload_btn');
                    if (retryBtn) {
                        retryBtn.dataset.show = '';
                        retryBtn.classList.add('hidden');
                    }

                    return; // Success, exit function

                } catch (fetchError) {
                    if (uploadAttempts >= maxAttempts) {
                        throw fetchError;
                    }
                    // Continue to retry
                }
            }

        } catch (err) {
            const errorMessage = err?.message || err || '알 수 없는 오류';
            this.statusManager.setStatus(`❌ 제출 실패: ${errorMessage}`);
            this.toastManager.show(`제출 실패: ${errorMessage}`, 'bg-red-500');
            this.progressManager.setProgress(0, '');
            this.progressManager.show(false);

            // Show retry button
            const retryBtn = document.getElementById('retry_upload_btn');
            if (retryBtn) {
                retryBtn.dataset.show = '1';
                retryBtn.classList.remove('hidden');
            }
        } finally {
            this.disableSubmitUI(false);
        }
    }

    async retryLastUpload() {
        try {
            if (!this.lastZipBlob || !this.lastMeta) {
                this.toastManager.show('재시도할 항목이 없습니다.', 'bg-red-500');
                return;
            }

            this.disableSubmitUI(true);
            this.statusManager.setStatus('저장준비중입니다. 잠시 기다려 주세요');
            this.progressManager.show(true);
            this.progressManager.setProgress(45, '업로드 준비...');

            const b64 = await this.blobToBase64(this.lastZipBlob);
            const sizeBytes = this.bytesFromBase64(b64);

            if (sizeBytes > 8 * 1024 * 1024) {
                this.statusManager.setStatus('업로드 실패: ZIP 용량 초과 (8MB)');
                this.toastManager.show('ZIP 파일 용량이 8MB를 초과합니다.', 'bg-red-500');
                return;
            }

            // Use the same multi-file format as main function
            const payload = {
                studentId: this.lastMeta.studentId,
                subject: this.SUBJECT,
                section: this.lastMeta.section,
                files: [{
                    filename: this.lastMeta.zipFilename,
                    contentBase64: b64,
                    mime: 'application/zip'
                }]
            };

            const res = await this.fetchWithTimeout(this.ENDPOINT, 20000, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Submission-Key': this.SUBMIT_KEY,
                },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            let data = {};
            try {
                data = JSON.parse(text);
            } catch (_) {
                data = { raw: text };
            }

            if (!res.ok) {
                const reason = data.error || data.detail || data.message || res.statusText || '업로드 실패';
                this.statusManager.setStatus(`제출 실패: ${reason}`);
                this.toastManager.show(`제출 실패: ${reason}`, 'bg-red-500');
                return;
            }

            // Success
            const uploadedFile = data.files?.[0];
            const filePath = uploadedFile?.name || this.lastMeta.zipFilename;
            const fullPath = `/과제제출/${this.SUBJECT}/${this.lastMeta.section}/${this.lastMeta.studentId}/${filePath}`;

            this.statusManager.setStatus(`✅ 제출 완료! 저장 경로: ${fullPath} — 다운로드 확인 중…`);
            this.progressManager.setProgress(85, '다운로드 준비...');
            this.downloadManager.attemptLocalDownloadAndVerify(this.lastMeta.zipFilename);
            this.progressManager.setProgress(100, '완료');
            setTimeout(() => this.progressManager.show(false), 1500);

            // Clear retry state
            const retryBtn = document.getElementById('retry_upload_btn');
            if (retryBtn) {
                retryBtn.dataset.show = '';
                retryBtn.classList.add('hidden');
            }

        } catch (err) {
            const errorMessage = err?.message || err || '알 수 없는 오류';
            this.statusManager.setStatus(`❌ 제출 실패: ${errorMessage}`);
            this.toastManager.show(`제출 실패: ${errorMessage}`, 'bg-red-500');
        } finally {
            this.disableSubmitUI(false);
            this.progressManager.setProgress(0, '');
            this.progressManager.show(false);
        }
    }

    // Helper methods
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result || '';
                const commaIdx = String(result).indexOf(',');
                const b64 = commaIdx >= 0 ? String(result).slice(commaIdx + 1) : String(result);
                resolve(b64);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }

    bytesFromBase64(b64) {
        const len = b64.length;
        const pad = (b64.endsWith('==') ? 2 : (b64.endsWith('=') ? 1 : 0));
        return Math.floor((len * 3) / 4) - pad;
    }

    calcSectionCode(grade, klass) {
        const g = String(grade || '').trim();
        const k = String(klass || '').trim().padStart(2, '0');
        return `${g}${k}`;
    }

    calcStudentId(grade, klass, number) {
        const g = String(grade || '').trim();
        const k = String(klass || '').trim().padStart(2, '0');
        const n = String(number || '').trim().padStart(2, '0');
        return `${g}${k}${n}`;
    }

    generateDocHtml(dynamicTitle, reportInnerHtml) {
        // Create HTML template with embedded CSS
        const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dynamicTitle}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap" rel="stylesheet">
        <style>
/* Base */
body { font-family: 'Noto Sans KR','Inter',sans-serif; background-color: #f3f4f6; margin:0; }
* { color: inherit !important; }

/* Report page layout */
.report-page {
    background-color: #ffffff;
    padding: 2.5cm 2cm;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    color: #1f2937; /* gray-800 */
}
.printable-area { width: 100%; }

/* Typography */
.report-main-title {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 2.25rem; /* text-3xl */
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    border-bottom: 2px solid #111827; /* gray-900 */
    padding-bottom: 1rem;
}
.report-section-title {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 1.5rem;
    font-weight: 700; /* bold */
    color: #111827; /* gray-900 */
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #d1d5db; /* gray-300 */
}
.preview-text {
    white-space: pre-wrap;
    word-break: break-word;
    min-height: 2.5em;
    line-height: 1.8;
    color: #374151; /* gray-700 */
    font-family: 'Nanum Myeongjo', serif; /* 본문은 명조체 유지 */
}
.preview-placeholder { color: #9ca3af !important; font-style: italic; }
ol, ul { padding-left: 1.5rem; }
li { margin-bottom: 0.5rem; }

/* Print */
@page { size: A4 portrait; margin: 2cm; }
@media print {
    body * { visibility: hidden; }
    .printable-area, .printable-area * { visibility: visible; }
    .printable-area {
        position: absolute; left: 0; top: 0;
        width: 100%; padding: 0; margin: 0;
        box-shadow: none; border: none;
    }
    .no-print { display: none; }
}
        </style>
</head>
<body>
    <div class="report-page">
        <div class="printable-area">
${reportInnerHtml}
        </div>
    </div>
</body>
</html>`;

        return htmlContent;
    }

    getDocTitle() {
        const titleEl = document.getElementById('preview_main_title');
        const t = (titleEl?.textContent || '').trim();
        return t || '보고서';
    }
}
