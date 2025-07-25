import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface User {
  userId: string;
}

interface NavBarProps {
  onMenuClick?: () => void;
  user?: User | null;
  setUser?: (user: User | null) => void;
  title?: string;
}

export default function NavBar({ onMenuClick, user, setUser, title = "KOSA" }: NavBarProps): JSX.Element {
  const [showAuthPopover, setShowAuthPopover] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem("user");
    setShowAuthPopover(false);
    setUser && setUser(null);
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-white shadow z-50" style={{height: 56}}>
      <Menu size={28} className="cursor-pointer text-blue-600" onClick={onMenuClick} />
      <span className="text-xl font-bold text-blue-600">{title}</span>
      <div className="relative">
        <User
          size={28}
          className="cursor-pointer text-blue-600"
          onClick={() => setShowAuthPopover((v) => !v)}
        />
        {showAuthPopover && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow p-4 z-20">
            {user ? (
              <>
                <div className="mb-2 text-gray-800 font-semibold">{user.userId}님</div>
                <button
                  className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                  onClick={() => { setShowAuthPopover(false); navigate('/mypage'); }}
                >
                  마이페이지
                </button>
                <button
                  className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                  onClick={() => { setShowAuthPopover(false); navigate('/login'); }}
                >
                  로그인
                </button>
                <button
                  className="w-full text-left py-1 px-2 hover:bg-gray-100 rounded"
                  onClick={() => { setShowAuthPopover(false); navigate('/signup'); }}
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}