// testing/src/science-experiments/suhaeng3-test/modules/image-processor.js
// 이미지 처리 및 최적화 모듈

export class ImageProcessor {
  static MAX_WIDTH = 1200;
  static MAX_HEIGHT = 1200;
  static QUALITY = 0.85;
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  /**
   * 이미지 파일을 처리하고 최적화합니다
   * @param {File} file - 원본 이미지 파일
   * @returns {Promise<Object>} 처리된 이미지 데이터
   */
  static async processImage(file) {
    try {
      // 파일 크기 확인
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`파일 크기가 너무 큽니다. 최대 ${this.MAX_FILE_SIZE / 1024 / 1024}MB까지 허용됩니다.`);
      }
      
      // 이미지 타입 확인
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드할 수 있습니다.');
      }
      
      // 이미지 리사이징
      const resizedBlob = await this.resizeImage(file);
      
      // Base64 변환
      const base64 = await this.toBase64(resizedBlob);
      
      // 메타데이터 수집
      const metadata = await this.getImageMetadata(resizedBlob);
      
      return {
        original: file,
        processed: resizedBlob,
        base64: base64,
        metadata: {
          name: file.name,
          size: resizedBlob.size,
          type: resizedBlob.type,
          dimensions: metadata.dimensions,
          originalSize: file.size,
          compressionRatio: Math.round((1 - resizedBlob.size / file.size) * 100)
        }
      };
    } catch (error) {
      console.error('이미지 처리 실패:', error);
      throw error;
    }
  }
  
  /**
   * 이미지를 리사이징합니다
   * @param {File} file - 원본 이미지 파일
   * @returns {Promise<Blob>} 리사이징된 이미지 Blob
   */
  static async resizeImage(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          const { width, height } = this.calculateDimensions(
            img.width, img.height, this.MAX_WIDTH, this.MAX_HEIGHT
          );
          
          canvas.width = width;
          canvas.height = height;
          
          // 고품질 리사이징
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(resolve, 'image/jpeg', this.QUALITY);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * 최적의 이미지 크기를 계산합니다
   * @param {number} originalWidth - 원본 너비
   * @param {number} originalHeight - 원본 높이
   * @param {number} maxWidth - 최대 너비
   * @param {number} maxHeight - 최대 높이
   * @returns {Object} 계산된 크기
   */
  static calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    
    // 비율이 1보다 크면 원본 크기 유지
    if (ratio >= 1) {
      return { width: originalWidth, height: originalHeight };
    }
    
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }
  
  /**
   * Blob을 Base64로 변환합니다
   * @param {Blob} blob - 변환할 Blob
   * @returns {Promise<string>} Base64 문자열
   */
  static async toBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  /**
   * 이미지 메타데이터를 수집합니다
   * @param {Blob} blob - 이미지 Blob
   * @returns {Promise<Object>} 메타데이터
   */
  static async getImageMetadata(blob) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          dimensions: {
            width: img.width,
            height: img.height
          }
        });
      };
      img.src = URL.createObjectURL(blob);
    });
  }
  
  /**
   * 이미지 파일 유효성을 검사합니다
   * @param {File} file - 검사할 파일
   * @returns {boolean} 유효성 여부
   */
  static validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return false;
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 파일 크기를 사람이 읽기 쉬운 형태로 변환합니다
   * @param {number} bytes - 바이트 크기
   * @returns {string} 포맷된 크기 문자열
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 이미지 업로드 매니저 클래스
export class ImageUploadManager {
  constructor() {
    this.images = new Map();
    this.setupEventListeners();
  }
  
  /**
   * 이벤트 리스너를 설정합니다
   */
  setupEventListeners() {
    // 이미지 슬롯 클릭 이벤트
    document.addEventListener('click', (event) => {
      if (event.target.closest('.image-slot')) {
        const slot = event.target.closest('.image-slot');
        const input = slot.querySelector('.image-input');
        input.click();
      }
    });
    
    // 파일 입력 변경 이벤트
    document.addEventListener('change', (event) => {
      if (event.target.classList.contains('image-input')) {
        const slot = event.target.closest('.image-slot');
        const files = Array.from(event.target.files);
        this.handleImageUpload(files, slot);
      }
    });
    
    // 드래그 앤 드롭 이벤트
    document.addEventListener('dragover', (event) => {
      if (event.target.closest('.image-slot')) {
        event.preventDefault();
        event.target.closest('.image-slot').classList.add('dragover');
      }
    });
    
    document.addEventListener('dragleave', (event) => {
      if (event.target.closest('.image-slot')) {
        event.target.closest('.image-slot').classList.remove('dragover');
      }
    });
    
    document.addEventListener('drop', (event) => {
      if (event.target.closest('.image-slot')) {
        event.preventDefault();
        const slot = event.target.closest('.image-slot');
        slot.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        this.handleImageUpload(imageFiles, slot);
      }
    });
  }
  
  /**
   * 이미지 업로드를 처리합니다
   * @param {File[]} files - 업로드할 파일들
   * @param {HTMLElement} slot - 이미지 슬롯 요소
   */
  async handleImageUpload(files, slot) {
    if (files.length === 0) return;
    
    const file = files[0]; // 첫 번째 파일만 처리
    const slotId = slot.dataset.slot;
    
    try {
      // 유효성 검사
      if (!ImageProcessor.validateImageFile(file)) {
        throw new Error('지원하지 않는 이미지 형식이거나 파일 크기가 너무 큽니다.');
      }
      
      // 로딩 상태 표시
      this.showLoading(slot);
      
      // 이미지 처리
      const processedImage = await ImageProcessor.processImage(file);
      
      // 미리보기 표시
      this.showImagePreview(slot, processedImage);
      
      // 데이터 저장
      this.images.set(slotId, processedImage);
      
      console.log(`이미지 업로드 완료: ${file.name}`, processedImage.metadata);
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      this.showError(slot, error.message);
    }
  }
  
  /**
   * 로딩 상태를 표시합니다
   * @param {HTMLElement} slot - 이미지 슬롯 요소
   */
  showLoading(slot) {
    slot.innerHTML = `
      <div class="image-loading">
        <div class="loading-spinner"></div>
        <p>이미지 처리 중...</p>
      </div>
    `;
  }
  
  /**
   * 이미지 미리보기를 표시합니다
   * @param {HTMLElement} slot - 이미지 슬롯 요소
   * @param {Object} imageData - 처리된 이미지 데이터
   */
  showImagePreview(slot, imageData) {
    const { metadata, base64 } = imageData;
    
    slot.innerHTML = `
      <div class="image-preview">
        <img src="${base64}" alt="${metadata.name}" class="preview-image">
        <div class="image-info">
          <div class="image-details">
            <span class="filename">${metadata.name}</span>
            <span class="file-size">${ImageProcessor.formatFileSize(metadata.size)}</span>
            <span class="dimensions">${metadata.dimensions.width}×${metadata.dimensions.height}</span>
          </div>
          <button class="remove-btn" onclick="imageUploadManager.removeImage('${slot.dataset.slot}')">×</button>
        </div>
      </div>
    `;
  }
  
  /**
   * 오류 상태를 표시합니다
   * @param {HTMLElement} slot - 이미지 슬롯 요소
   * @param {string} message - 오류 메시지
   */
  showError(slot, message) {
    slot.innerHTML = `
      <div class="image-error">
        <div class="error-icon">⚠️</div>
        <p class="error-message">${message}</p>
        <button class="retry-btn" onclick="location.reload()">다시 시도</button>
      </div>
    `;
  }
  
  /**
   * 이미지를 제거합니다
   * @param {string} slotId - 슬롯 ID
   */
  removeImage(slotId) {
    this.images.delete(slotId);
    const slot = document.querySelector(`[data-slot="${slotId}"]`);
    this.resetSlot(slot);
  }
  
  /**
   * 슬롯을 초기 상태로 리셋합니다
   * @param {HTMLElement} slot - 이미지 슬롯 요소
   */
  resetSlot(slot) {
    slot.innerHTML = `
      <div class="image-placeholder">
        <i class="camera-icon">📷</i>
        <p>이미지를 드래그하거나 클릭하여 업로드</p>
      </div>
      <input type="file" accept="image/*" class="image-input" hidden>
    `;
  }
  
  /**
   * 모든 이미지 데이터를 반환합니다
   * @returns {Map} 이미지 데이터 맵
   */
  getAllImages() {
    return this.images;
  }
  
  /**
   * 이미지 개수를 반환합니다
   * @returns {number} 이미지 개수
   */
  getImageCount() {
    return this.images.size;
  }
}

// 전역 인스턴스 생성
export const imageUploadManager = new ImageUploadManager();
