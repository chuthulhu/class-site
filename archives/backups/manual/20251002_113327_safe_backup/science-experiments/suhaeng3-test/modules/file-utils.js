// 파일 처리 유틸리티 모듈
// 파일 다운로드, Base64 변환, 파일명 생성 등 파일 관련 기능

export class FileProcessor {
    static blobToBase64(blob) {
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

    static bytesFromBase64(b64) {
        const len = b64.length;
        const pad = (b64.endsWith('==') ? 2 : (b64.endsWith('=') ? 1 : 0));
        return Math.floor((len * 3) / 4) - pad;
    }

    static triggerBlobDownload(blob, filename) {
        try {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            return true;
        } catch (_) {
            return false;
        }
    }

    static async saveWithPicker(blob, filename) {
        try {
            const opts = {
                suggestedName: filename,
                types: [{ description: 'ZIP file', accept: { 'application/zip': ['.zip'] } }],
            };
            const handle = await window.showSaveFilePicker(opts);
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return true;
        } catch (_) { 
            return false; 
        }
    }
}

export class FilenameGenerator {
    static getReportFilename() {
        const grade = (document.getElementById('student_grade').value || '1').trim();
        const studentClass = (document.getElementById('student_class').value || '0').trim().padStart(2, '0');
        const studentNumber = (document.getElementById('student_number').value || '0').trim().padStart(2, '0');
        const studentId = `${grade}${studentClass}${studentNumber}`;
        const studentName = document.getElementById('student_name').value.trim() || '이름없음';
        return `${studentId}_${studentName}_스마트모빌리티_제안서`;
    }

    static generateTimestampedFilename(baseName, extension = 'zip') {
        const fmt = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
        const timestamp = `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
        return `${baseName}_${timestamp}.${extension}`;
    }

    static calcSectionCode(grade, klass) {
        const g = String(grade || '').trim();
        const k = String(klass || '').trim().padStart(2, '0');
        return `${g}${k}`;
    }

    static calcStudentId(grade, klass, number) {
        const g = String(grade || '').trim();
        const k = String(klass || '').trim().padStart(2, '0');
        const n = String(number || '').trim().padStart(2, '0');
        return `${g}${k}${n}`;
    }
}

export class DocumentGenerator {
    static generateDocHtml(dynamicTitle, reportInnerHtml) {
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

    static getDocTitle() {
        const titleEl = document.getElementById('preview_main_title');
        const t = (titleEl?.textContent || '').trim();
        return t || '보고서';
    }
}

export class DownloadManager {
    constructor(progressManager, toastManager, statusManager) {
        this.progressManager = progressManager;
        this.toastManager = toastManager;
        this.statusManager = statusManager;
        this.lastZipBlob = null;
        this.lastMeta = null;
        this.inappRetryCount = 0;
        this.inappRetryMax = 2;
    }

    setLastZip(zipBlob, meta) {
        this.lastZipBlob = zipBlob;
        this.lastMeta = meta;
    }

    async attemptLocalDownloadAndVerify(zipFilename) {
        const env = EnvironmentDetector.detectInApp();

        // In-app browsers are known to block/ignore a[download]/Blob → fallback to server
        if (env.isInApp) {
            this.statusManager.setStatus('로컬 다운로드가 제한되어 서버 다운로드로 전환합니다.');
            this.showInAppModal();
            try { 
                this.serverDownloadLastZip(); 
            } catch(_) {}
            return;
        }

        // iOS Safari: guide to Files via share sheet
        if (EnvironmentDetector.isIOS()) {
            this.statusManager.setStatus('iOS 저장 안내를 표시합니다.');
            this.showIOSModal();
            return;
        }

        let localSaved = false;
        let usedPicker = false;
        
        // Prefer native Save As dialog where supported (Chromium-based)
        if (window.showSaveFilePicker && this.lastZipBlob) {
            usedPicker = true;
            localSaved = await FileProcessor.saveWithPicker(this.lastZipBlob, zipFilename);
        }
        
        // Fallback to default a[download]
        if (!localSaved && this.lastZipBlob) {
            try { 
                localSaved = FileProcessor.triggerBlobDownload(this.lastZipBlob, zipFilename) === true; 
            } catch (_) { 
                localSaved = false; 
            }
        }

        // Android/Samsung browsers may silently ignore a[download] for Blobs
        if (env.isAndroid || env.isSamsung) {
            if (!usedPicker) {
                localSaved = false;
            }
        }

        if (localSaved) {
            this.statusManager.setStatus('✅ 로컬 다운로드가 완료되었습니다.');
            this.toastManager.show('로컬 다운로드 완료', 'bg-green-600');
        } else {
            this.statusManager.setStatus('로컬 다운로드 실패 또는 제한됨, 서버에서 다운로드합니다.');
            this.showInAppModal();
            try { 
                this.serverDownloadLastZip(); 
            } catch(_) {}
        }
    }

    showInAppModal() {
        const modal = document.getElementById('inapp-download-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    showIOSModal() {
        const modal = document.getElementById('ios-help-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    serverDownloadLastZip(isManualRetry = false) {
        try {
            if (!this.lastZipBlob || !this.lastMeta?.zipFilename) {
                this.toastManager.show('다운로드할 파일이 없습니다.', 'bg-red-500');
                return;
            }
            
            // Convert blob -> base64 then POST via a form to open in new tab
            FileProcessor.blobToBase64(this.lastZipBlob).then((b64) => {
                try {
                    const token = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
                    // heartbeat checker
                    this.trackServerDownload(token, 3500);
                    const form = document.createElement('form');
                    form.method = 'POST';
                        form.action = '/.netlify/functions/download_test';
                    form.target = '_blank';
                    const add = (n, v) => { 
                        const i = document.createElement('input'); 
                        i.type = 'hidden'; 
                        i.name = n; 
                        i.value = v; 
                        form.appendChild(i); 
                    };
                    add('filename', this.lastMeta.zipFilename);
                    add('mime', 'application/zip');
                    add('contentBase64', b64);
                    add('token', token);
                    document.body.appendChild(form);
                    form.submit();
                    document.body.removeChild(form);
                    this.toastManager.show('서버에서 다운로드를 시작합니다.');
                    
                    // 성공 시 모달 닫고 재시도 버튼 숨김/카운터 초기화
                    this.inappRetryCount = 0;
                    this.setInappRetryVisibility(false);
                    const modal = document.getElementById('inapp-download-modal');
                    if (modal) modal.classList.add('hidden');
                } catch (e) {
                    throw e;
                }
            }).catch(() => {
                // base64 변환 실패도 실패로 취급
                throw new Error('base64 변환 실패');
            });
        } catch (_) {
            this.inappRetryCount += 1;
            if (this.inappRetryCount <= this.inappRetryMax) {
                this.setInappRetryVisibility(true);
                this.toastManager.show(`서버 다운로드에 실패했습니다. 재시도 가능 (${this.inappRetryCount}/${this.inappRetryMax})`, 'bg-yellow-600');
            } else {
                this.setInappRetryVisibility(false);
                this.toastManager.show('서버 다운로드에 반복 실패했습니다. 잠시 후 다시 시도하세요.', 'bg-red-500');
            }
        }
    }

    setInappRetryVisibility(show) {
        const retryBtn = document.getElementById('inapp-retry-btn');
        if (!retryBtn) return;
        retryBtn.classList.toggle('hidden', !show);
    }

    trackServerDownload(token, timeoutMs = 5000) {
        const deadline = Date.now() + timeoutMs;
        const key = `download_ok_${encodeURIComponent(token)}=`;
        const timer = setInterval(() => {
            const found = document.cookie.includes(key);
            if (found) {
                clearInterval(timer);
                this.statusManager.setStatus('✅ 로컬 저장(서버 첨부) 확인되었습니다.');
                this.toastManager.show('다운로드 완료 확인', 'bg-green-600');
            } else if (Date.now() > deadline) {
                clearInterval(timer);
            }
        }, 300);
    }
}
