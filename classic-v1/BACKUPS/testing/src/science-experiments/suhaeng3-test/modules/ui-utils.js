// UI 유틸리티 모듈
// 진행 상태 표시, 토스트 알림, 모달 관리 등 UI 관련 기능

export class ProgressManager {
    constructor() {
        this.progressContainer = document.getElementById('progress_container');
        this.progressBar = document.getElementById('progress_bar');
        this.progressText = document.getElementById('progress_text');
        this.progressDetails = document.getElementById('progress_details');
    }

    show(show = true) {
        if (!this.progressContainer) return;
        this.progressContainer.classList.toggle('hidden', !show);
        this.progressContainer.setAttribute('aria-hidden', show ? 'false' : 'true');
        
        if (this.progressDetails) {
            this.progressDetails.classList.toggle('hidden', !show);
        }
    }

    setProgress(percent, label = '', details = '') {
        if (this.progressBar) {
            this.progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
            // 진행률에 따른 색상 변경
            if (percent < 30) {
                this.progressBar.className = 'bg-yellow-500 h-3 rounded-full transition-all duration-300';
            } else if (percent < 70) {
                this.progressBar.className = 'bg-blue-500 h-3 rounded-full transition-all duration-300';
            } else {
                this.progressBar.className = 'bg-green-500 h-3 rounded-full transition-all duration-300';
            }
        }
        if (this.progressText) this.progressText.textContent = label || '';
        if (this.progressDetails) this.progressDetails.textContent = details || '';
    }

    setDetails(step, total, currentFile = '', fileSize = 0) {
        if (!this.progressDetails) return;
        
        let detailText = '';
        if (step && total) {
            detailText = `단계 ${step}/${total}`;
        }
        if (currentFile) {
            detailText += ` • 파일: ${currentFile}`;
        }
        if (fileSize > 0) {
            const sizeMB = (fileSize / 1024 / 1024).toFixed(1);
            detailText += ` • 크기: ${sizeMB}MB`;
        }
        
        this.progressDetails.textContent = detailText;
    }
}

export class ToastManager {
    constructor() {
        this.toast = document.getElementById('toast-notification');
        this.timer = null;
    }

    show(message, bgColor = 'bg-gray-800') {
        if (!this.toast) return;
        
        clearTimeout(this.timer);
        this.toast.textContent = message;
        this.toast.className = 'fixed bottom-5 right-5 text-white py-3 px-5 rounded-lg shadow-lg transition-opacity duration-300 no-print ' + bgColor;
        this.toast.style.opacity = '1';
        
        this.timer = setTimeout(() => {
            this.toast.style.opacity = '0';
        }, 2000);
    }
}

export class ModalManager {
    constructor() {
        this.lastTriggerEl = null;
    }

    getFocusable(el) {
        return el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    }

    show(el, triggerEl = null) {
        this.lastTriggerEl = triggerEl || document.activeElement;
        el.classList.remove('hidden');
        const f = this.getFocusable(el);
        if (f.length) f[0].focus();
        
        const onKey = (e) => {
            if (e.key !== 'Tab') return;
            const focusables = Array.from(this.getFocusable(el));
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { 
                e.preventDefault(); 
                last.focus(); 
            } else if (!e.shiftKey && document.activeElement === last) { 
                e.preventDefault(); 
                first.focus(); 
            }
        };
        
        el.__trapHandler = onKey;
        el.addEventListener('keydown', onKey);
    }

    hide(el) {
        el.classList.add('hidden');
        if (el.__trapHandler) el.removeEventListener('keydown', el.__trapHandler);
        if (this.lastTriggerEl && typeof this.lastTriggerEl.focus === 'function') {
            this.lastTriggerEl.focus();
        }
    }
}

export class StatusManager {
    constructor() {
        this.statusElement = document.getElementById('submit_status');
    }

    setStatus(text) {
        if (this.statusElement) {
            this.statusElement.textContent = text || '';
        }
    }
}

// 환경 감지 유틸리티
export class EnvironmentDetector {
    static isIOS() {
        const ua = navigator.userAgent || navigator.vendor || '';
        const iOSDevice = /iPad|iPhone|iPod/.test(ua);
        const iPadOSDesktopUA = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return iOSDevice || iPadOSDesktopUA;
    }

    static detectInApp() {
        const uaRaw = navigator.userAgent || navigator.vendor || '';
        const ua = uaRaw.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /android/.test(ua);
        const isSamsung = /samsungbrowser/i.test(uaRaw);
        const isKakao = /kakaotalk/.test(ua);
        const isNaver = /naver/.test(ua);
        const isFB = /fban|fbav|fb_iab/.test(ua);
        const isIG = /instagram/.test(ua);
        const isLine = / line\//.test(ua);
        const isIOSWebView = isIOS && !!window.webkit && !!window.webkit.messageHandlers && !/safari/i.test(uaRaw);
        const isInApp = isKakao || isNaver || isFB || isIG || isLine || isIOSWebView;
        
        let app = null;
        if (isKakao) app = 'kakao';
        else if (isNaver) app = 'naver';
        else if (isIG) app = 'instagram';
        else if (isFB) app = 'facebook';
        else if (isLine) app = 'line';
        else if (isIOSWebView) app = 'ios-webview';
        
        return { isInApp, app, isIOS, isAndroid, isSamsung };
    }
}
