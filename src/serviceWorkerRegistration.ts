// 참고 https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // URL 생성자는 SW를 지원하는 모든 브라우저에서 사용할 수 있습니다.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URL이 다른 출처에 있으면 service worker가 작동하지 않습니다.
      // CDN이 자산을 제공하는 데 사용되는 경우 발생할 수 있습니다.
      // 참고 https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // 이것은 localhost에서 실행 중입니다. service worker가 아직 존재하는지 확인해보자.
        checkValidServiceWorker(swUrl, config);

        // localhost에 로그를 추가하여 개발자에게 서비스 워커/PWA 문서 보여주기
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // localhost가 아닙니다. service worker를 등록하기만 하면 됩니다.
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 이 시점에서 미리 캐시된 콘텐츠를 가져왔습니다.
              // 그러나 이전 service worker는 모든 클라이언트 탭이 닫힐 때까지 이전 콘텐츠를 계속 제공합니다.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // 콜백 실행
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // 이 시점에서 모든 것이 미리 캐시되었습니다.
              // "콘텐츠는 오프라인 사용을 위해 캐시됩니다." 라는 메시지를 표시하기에 완벽합니다.
              console.log('Content is cached for offline use.');

              // 콜백 실행
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // 페이지를 새로고침할 수 없는 경우 service worker를 찾을 수 있는지 확인하십시오. 
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // service worker가 존재하는지, 그리고 실제로 JS 파일을 받고 있는지 확인하십시오.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // service worker를 찾을 수 없습니다. 아마 다른 앱일 것입니다. 페이지를 새로고침합니다.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // service worker를 찾았습니다. 정상적으로 진행합니다.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
