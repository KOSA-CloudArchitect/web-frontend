import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setUser(null);
      }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }
    try {
      const res = await fetch("https://kosa-backend-315281980252.asia-northeast3.run.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password })
      });
      if (res.ok) {
        // 로그인 성공
        localStorage.setItem("user", JSON.stringify({ userId }));
        navigate("/");
      } else {
        const data = await res.json();
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      alert("서버 오류: " + err.message);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <div className="flex flex-col items-center mb-8">
            <span className="text-4xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
          </div>
          <h2 className="text-2xl font-bold mb-6">이미 로그인중입니다.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">사용자 ID</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디를 입력하세요"
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">비밀번호</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          로그인
        </button>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
          <button
            type="button"
            className="text-gray-600 hover:underline"
            onClick={() => alert('비밀번호 찾기 기능은 준비중입니다.')}
          >
            비밀번호 찾기
          </button>
        </div>
      </form>
    </div>
  );
} 