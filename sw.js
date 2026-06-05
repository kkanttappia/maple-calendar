// sw.js - 메이플 파티 캘린더 서비스 워커
// 네트워크 우선 전략: 항상 최신 버전 사용, 오프라인 시만 캐시 사용

const CACHE_NAME = 'maple-party-v1';
const OFFLINE_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// 설치 시 기본 파일 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_CACHE))
  );
  self.skipWaiting();
});

// 활성화 시 구 버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리: 네트워크 우선 → 실패 시 캐시
self.addEventListener('fetch', event => {
  // POST 요청이나 외부 API는 캐시 안 함
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  if (event.request.url.includes('firebase')) return;
  if (event.request.url.includes('googleapis')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공 시 캐시 업데이트 (항상 최신 유지)
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 오프라인 시 캐시에서 응답
        return caches.match(event.request).then(r => r || caches.match('/index.html'));
      })
  );
});
