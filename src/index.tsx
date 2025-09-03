import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

// MSW 브라우저 워커 초기화 (개발 환경에서만)
// 현재 백엔드 연동 테스트를 위해 MSW 비활성화
/*
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  
  return worker.start({
    onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 실제 서버로 전달
  });
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
*/

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

