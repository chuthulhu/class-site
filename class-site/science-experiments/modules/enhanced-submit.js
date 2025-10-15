// class-site/science-experiments/modules/enhanced-submit.js
// CORS 문제를 해결한 향상된 제출 모듈

import { corsBypassFetch, uploadToOneDrive, resilientFetch } from './cors-bypass.js';

/**
 * CORS 문제를 해결한 파일 제출
 */
export async function submitWithCorsFix(files, metadata) {
  try {
    // 방법 1: 직접 제출 시도
    const directResult = await submitDirect(files, metadata);
    if (directResult.success) {
      return directResult;
    }
    
    // 방법 2: 프록시를 통한 제출
    const proxyResult = await submitViaProxy(files, metadata);
    if (proxyResult.success) {
      return proxyResult;
    }
    
    // 방법 3: 청크 단위 제출
    const chunkResult = await submitInChunks(files, metadata);
    return chunkResult;
    
  } catch (error) {
    console.error('All submission methods failed:', error);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * 직접 제출 시도
 */
async function submitDirect(files, metadata) {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`file_${index}`, file);
  });
  
  formData.append('metadata', JSON.stringify(metadata));
  
  const response = await fetch('/.netlify/functions/submit', {
    method: 'POST',
    headers: {
      'X-Submission-Key': metadata.submissionKey || 'default'
    },
    body: formData
  });
  
  if (response.ok) {
    return {
      success: true,
      data: await response.json(),
      method: 'direct'
    };
  }
  
  throw new Error(`Direct submission failed: ${response.status}`);
}

/**
 * 프록시를 통한 제출
 */
async function submitViaProxy(files, metadata) {
  const fileData = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      contentBase64: await fileToBase64(file),
      mime: file.type
    }))
  );
  
  const payload = {
    files: fileData,
    metadata: metadata
  };
  
  const response = await corsBypassFetch('/.netlify/functions/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Submission-Key': metadata.submissionKey || 'default'
    },
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    return {
      success: true,
      data: await response.json(),
      method: 'proxy'
    };
  }
  
  throw new Error(`Proxy submission failed: ${response.status}`);
}

/**
 * 청크 단위 제출 (대용량 파일용)
 */
async function submitInChunks(files, metadata) {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 청크
  const results = [];
  
  for (const file of files) {
    if (file.size <= CHUNK_SIZE) {
      // 작은 파일은 직접 제출
      const result = await submitSingleFile(file, metadata);
      results.push(result);
    } else {
      // 큰 파일은 청크로 나누어 제출
      const chunks = await splitFileIntoChunks(file, CHUNK_SIZE);
      const chunkResults = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkResult = await submitFileChunk(chunks[i], i, chunks.length, metadata);
        chunkResults.push(chunkResult);
      }
      
      // 청크들을 하나로 합치기
      const finalResult = await mergeFileChunks(chunkResults, file.name, metadata);
      results.push(finalResult);
    }
  }
  
  return {
    success: results.every(r => r.success),
    data: results,
    method: 'chunked'
  };
}

/**
 * 파일을 Base64로 변환
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 파일을 청크로 분할
 */
async function splitFileIntoChunks(file, chunkSize) {
  const chunks = [];
  let offset = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }
  
  return chunks;
}

/**
 * 단일 파일 제출
 */
async function submitSingleFile(file, metadata) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await resilientFetch('/.netlify/functions/submit', {
      method: 'POST',
      headers: {
        'X-Submission-Key': metadata.submissionKey || 'default'
      },
      body: formData
    });
    
    return {
      success: true,
      data: await response.json(),
      filename: file.name
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      filename: file.name
    };
  }
}

/**
 * 파일 청크 제출
 */
async function submitFileChunk(chunk, index, totalChunks, metadata) {
  const chunkMetadata = {
    ...metadata,
    chunkIndex: index,
    totalChunks: totalChunks,
    isChunk: true
  };
  
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('metadata', JSON.stringify(chunkMetadata));
  
  const response = await resilientFetch('/.netlify/functions/submit', {
    method: 'POST',
    headers: {
      'X-Submission-Key': metadata.submissionKey || 'default'
    },
    body: formData
  });
  
  return {
    success: response.ok,
    data: await response.json(),
    chunkIndex: index
  };
}

/**
 * 청크들을 하나로 합치기
 */
async function mergeFileChunks(chunkResults, filename, metadata) {
  const mergeMetadata = {
    ...metadata,
    filename: filename,
    action: 'merge',
    chunkCount: chunkResults.length
  };
  
  const response = await resilientFetch('/.netlify/functions/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Submission-Key': metadata.submissionKey || 'default'
    },
    body: JSON.stringify(mergeMetadata)
  });
  
  return {
    success: response.ok,
    data: await response.json(),
    filename: filename,
    method: 'merged'
  };
}

/**
 * OneDrive 직접 업로드 (CORS 우회)
 */
export async function uploadToOneDriveDirect(file, accessToken, folderPath = '') {
  try {
    const filename = folderPath ? `${folderPath}/${file.name}` : file.name;
    
    // 직접 업로드 시도
    const response = await uploadToOneDrive(file, filename, accessToken);
    
    return {
      success: true,
      data: response,
      method: 'direct'
    };
    
  } catch (error) {
    console.warn('Direct OneDrive upload failed:', error.message);
    
    // 프록시를 통한 업로드 시도
    try {
      const proxyResponse = await corsBypassFetch('/.netlify/functions/proxy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api: 'onedrive',
          endpoint: `/v1.0/me/drive/root:/${filename}:/content`,
          method: 'PUT',
          body: await fileToBase64(file)
        })
      });
      
      return {
        success: true,
        data: await proxyResponse.json(),
        method: 'proxy'
      };
      
    } catch (proxyError) {
      return {
        success: false,
        error: proxyError.message,
        fallback: true
      };
    }
  }
}

