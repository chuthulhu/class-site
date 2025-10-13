exports.handler = async (event) => {
  try {
    const now = new Date();
    const url = new URL(event.rawUrl || `https://${event.headers.host}${event.path}`);
    const page = url.searchParams.get('page') || 'default';
    
    // Page-specific time configurations
    const pageConfigs = {
      'suhaeng3-index': {
        releaseTime: '2025-10-12 00:00 KST',
        description: '수행평가3 허브 페이지'
      },
      'suhaeng3-session1': {
        releaseTime: '2025-10-12 00:00 KST',
        description: '수행평가3 1차시'
      },
      'suhaeng3-session2': {
        releaseTime: '2025-10-13 00:00 KST',
        description: '수행평가3 2차시'
      },
      'default': {
        releaseTime: '2025-10-12 00:00 KST',
        description: '기본 설정'
      }
    };
    
    const config = pageConfigs[page] || pageConfigs['default'];
    
    // Parse release time
    let releaseTime = null;
    let blockStartTime = null;
    let blockEndTime = null;
    
    if (config.releaseTime) {
      const releaseTimeStr = config.releaseTime;
      
      // Parse different time formats
      if (releaseTimeStr.includes(',')) {
        // Time range format
        const [start, end] = releaseTimeStr.split(',');
        blockStartTime = Date.parse(start.trim());
        blockEndTime = Date.parse(end.trim());
      } else if (releaseTimeStr.includes('KST') || releaseTimeStr.includes('KOR')) {
        // Korean time format
        const kstTimeStr = releaseTimeStr.replace(/KST|KOR/g, '').trim();
        const kstDate = new Date(kstTimeStr);
        releaseTime = kstDate.getTime() - (9 * 60 * 60 * 1000); // Convert KST to UTC
      } else if (releaseTimeStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
        // Korean time without KST suffix
        const kstDate = new Date(releaseTimeStr);
        releaseTime = kstDate.getTime() - (9 * 60 * 60 * 1000);
      } else {
        // Absolute UTC time
        releaseTime = Date.parse(releaseTimeStr);
      }
    }
    
    // Check if we're in a block period
    let isInBlock = false;
    if (blockStartTime && blockEndTime) {
      isInBlock = now.getTime() >= blockStartTime && now.getTime() <= blockEndTime;
    }
    
    const response = {
      now: now.getTime(),
      iso: now.toISOString(),
      timezone: 'UTC',
      page: page,
      config: config,
      debug: true
    };
    
    // Add time control info
    if (releaseTime && Number.isFinite(releaseTime)) {
      response.timeControl = {
        releaseTime: releaseTime,
        releaseTimeISO: new Date(releaseTime).toISOString(),
        isReleased: now.getTime() >= releaseTime,
        hoursUntilRelease: Math.ceil((releaseTime - now.getTime()) / (1000 * 60 * 60)),
        type: 'single'
      };
    }
    
    if (blockStartTime && blockEndTime) {
      response.timeControl = {
        blockStart: blockStartTime,
        blockEnd: blockEndTime,
        blockStartISO: new Date(blockStartTime).toISOString(),
        blockEndISO: new Date(blockEndTime).toISOString(),
        isInBlock: isInBlock,
        hoursUntilBlockEnd: Math.ceil((blockEndTime - now.getTime()) / (1000 * 60 * 60)),
        type: 'range'
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Time function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ 
        error: 'Time function failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};
