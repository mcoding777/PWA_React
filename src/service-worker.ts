/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// 빌드 프로세스에서 생성된 모든 자산을 미리 캐시합니다.
// 해당 URL은 아래 매니페스트 변수에 삽입됩니다.
// 이 변수는 사전 캐싱을 사용하지 않기로 결정한 경우에도 service worker 파일의 어딘가에 있어야 합니다.
precacheAndRoute(self.__WB_MANIFEST);

// 모든 탐색 요청이 index.html 셸로 이행되도록 앱 셸 스타일 라우팅을 설정합니다.
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // index.html에서 요청을 이행하지 않으려면 false를 반환합니다.
  ({ request, url }: { request: Request; url: URL }) => {
    // 내비게이션이 아닌 경우 건너뛰세요.
    if (request.mode !== 'navigate') {
      return false;
    }

    // /_로 시작하는 URL인 경우 건너뜁니다.
    if (url.pathname.startsWith('/_')) {
      return false;
    }

    // 파일 확장자가 포함되어 있기 때문에 리소스에 대한 URL처럼 보이면 건너뜁니다.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // 핸들러를 사용하고 싶다는 신호를 보내려면 true를 반환합니다.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// 프리캐시에서 처리하지 않는 요청에 대한 예제 런타임 캐싱 경로 (이 경우 공개에서와 같은 동일 출처 .png 요청)
registerRoute(
  // 필요에 따라 다른 파일 확장자 또는 라우팅 기준을 추가합니다.
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  // 예를 들어 CacheFirst로 변경하여 필요에 따라 이 전략을 사용자 정의합니다.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // 이 런타임 캐시가 최대 크기에 도달하면 가장 최근에 사용한 이미지가 제거됩니다.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// 이렇게 하면 웹 앱이 registration.waiting.postMessage({type: 'SKIP_WAITING'})를 통해 skipWaiting을 트리거할 수 있습니다.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 다른 모든 사용자 정의 service worker 논리는 여기로 이동할 수 있습니다.