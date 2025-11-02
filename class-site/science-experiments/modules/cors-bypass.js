// class-site/science-experiments/modules/cors-bypass.js
// 클라이언트 측에서 CORS 문제를 우회하는 유틸리티

/**
 * CORS 문제를 우회하여 외부 API 호출
 * @param {string} url - 호출할 URL
 * @param {Object} options - fetch 옵션
 * @returns {Promise} API 응답
 */
export async function corsBypassFetch(url, options = {}) {
  // 방법 1: 프록시 서버 사용
  if (url.includes('graph.microsoft.com') || url.includes('googleapis.com')) {
    return await proxyFetch(url, options);
  }
  
  // 방법 2: JSONP 방식 (GET 요청만)
  if (options.method === 'GET' || !options.method) {
    return await jsonpFetch(url, options);
  }
  
  // 방법 3: 이미지 로딩 방식 (단순 요청)
  if (options.method === 'POST' && !options.body) {
    return await imageFetch(url, options);
  }
  
  // 방법 4: 기본 fetch 시도
  try {
    return await fetch(url, options);
  } catch (error) {
    console.warn('Direct fetch failed, trying proxy:', error.message);
    return await proxyFetch(url, options);
  }
}

/**
 * 프록시 서버를 통한 API 호출
 */
async function proxyFetch(url, options) {
  const proxyUrl = '/.netlify/functions/proxy';
  
  // URL에서 API 타입 추출
  let apiType = 'webhook'; // 기본값
  if (url.includes('graph.microsoft.com')) apiType = 'onedrive';
  if (url.includes('googleapis.com')) apiType = 'google-drive';
  if (url.includes('dropboxapi.com')) apiType = 'dropbox';
  
  const proxyPayload = {
    api: apiType,
    endpoint: url.replace(/^https?:\/\/[^\/]+/, ''), // 도메인 제거
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body
  };
  
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(proxyPayload)
  });
  
  return response;
}

/**
 * JSONP 방식으로 GET 요청
 */
async function jsonpFetch(url, options) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 전역 콜백 함수 등록
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.head.removeChild(script);
      resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data))
      });
    };
    
    // 스크립트 태그로 요청
    const script = document.createElement('script');
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    script.onerror = () => {
      delete window[callbackName];
      document.head.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * 이미지 로딩을 통한 단순 요청
 */
async function imageFetch(url, options) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve('success')
      });
    };
    
    img.onerror = () => {
      reject(new Error('Image fetch failed'));
    };
    
    // URL에 파라미터 추가
    const separator = url.includes('?') ? '&' : '?';
    img.src = `${url}${separator}_t=${Date.now()}`;
  });
}

/**
 * OneDrive 업로드를 위한 특별한 처리
 */
export async function uploadToOneDrive(fileBlob, filename, accessToken) {
  try {
    // 직접 업로드 시도
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${filename}:/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBlob
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    throw new Error(`Upload failed: ${response.status}`);
    
  } catch (error) {
    console.warn('Direct OneDrive upload failed, trying proxy:', error.message);
    
    // 프록시를 통한 업로드
    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    
    const proxyResponse = await fetch('/.netlify/functions/proxy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
    
    return await proxyResponse.json();
  }
}

/**
 * Google Drive 업로드를 위한 특별한 처리
 */
export async function uploadToGoogleDrive(fileBlob, filename, accessToken) {
  try {
    // 직접 업로드 시도
    const metadata = {
      name: filename,
      parents: ['root']
    };
    
    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('file', fileBlob);
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    throw new Error(`Upload failed: ${response.status}`);
    
  } catch (error) {
    console.warn('Direct Google Drive upload failed, trying proxy:', error.message);
    
    // 프록시를 통한 업로드
    return await proxyFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
  }
}

/**
 * CORS 에러 감지 및 자동 재시도
 */
export async function resilientFetch(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await corsBypassFetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // CORS 에러가 아닌 경우 즉시 실패
      if (attempt === 1) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 재시도 전 대기
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}



