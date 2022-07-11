import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 앱이 오프라인에서 작동하고 더 빨리 로드되도록 하려면 다음을 변경할 수 있습니다.

// serviceWorkerRegistration.unregister();
serviceWorkerRegistration.register();