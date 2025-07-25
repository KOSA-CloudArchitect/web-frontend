import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !password || !password2 || !email) {
      alert("모든 항목을 입력하세요.");
      return;
    }
    if (password !== password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const res = await fetch("https://kosa-backend-315281980252.asia-northeast3.run.app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, email })
      });
      if (res.ok) {
        alert("회원가입 성공! 로그인 해주세요.");
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      alert("서버 오류: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl font-extrabold text-blue-600 tracking-widest">KOSA</span>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>
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
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">이메일</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">비밀번호</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">비밀번호 확인</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          회원가입
        </button>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => navigate('/login')}
          >
            이미 계정이 있으신가요? 로그인
          </button>
        </div>
      </form>
    </div>
  );
} 