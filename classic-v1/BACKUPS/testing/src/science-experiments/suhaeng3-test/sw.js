// Service Worker for offline support
// 캐시 전략: Cache First for static assets, Network First for API calls

const CACHE_NAME = 'suhaeng3-test-v1';
const STATIC_CACHE_NAME = 'suhaeng3-test-static-v1';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
    '/',
    '/science-experiments/suhaeng3-test/',
    '/science-experiments/suhaeng3-test/index.html',
    '/science-experiments/suhaeng3-test/modules/ui-utils.js',
    '/science-experiments/suhaeng3-test/modules/file-utils.js',
    '/science-experiments/suhaeng3-test/modules/upload-manager.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Nanum+Myeongjo:wght@400;700&display=swap'
];

// 설치 이벤트 - 정적 리소스 캐시
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// fetch 이벤트 - 요청 인터셉트
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API 요청 (Netlify Functions) - Network First 전략
    if (url.pathname.startsWith('/.netlify/functions/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // 성공적인 응답을 캐시에 저장
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // 네트워크 실패 시 캐시에서 응답
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // 캐시에도 없으면 오프라인 응답
                            return new Response(
                                JSON.stringify({
                                    ok: false,
                                    error: 'offline',
                                    detail: '인터넷 연결을 확인해주세요.'
                                }),
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );
                        });
                })
        );
        return;
    }

    // 정적 리소스 - Cache First 전략
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request)
                        .then((response) => {
                            // 성공적인 응답을 캐시에 저장
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(() => {
                            // 오프라인 페이지 반환
                            if (request.destination === 'document') {
                                return caches.match('/science-experiments/suhaeng3-test/index.html');
                            }
                            return new Response('오프라인 상태입니다.', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
    }
});

// 백그라운드 동기화 (선택적)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // 백그라운드에서 데이터 동기화 로직 구현 가능
    }
});

// 푸시 알림 (선택적)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '새로운 알림이 있습니다.',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey || 1
            },
            actions: [
                {
                    action: 'explore',
                    title: '확인',
                    icon: '/checkmark.png'
                },
                {
                    action: 'close',
                    title: '닫기',
                    icon: '/xmark.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || '알림', options)
        );
    }
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/science-experiments/suhaeng3-test/')
        );
    }
});
