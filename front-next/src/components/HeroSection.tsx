import React from 'react';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="text-content">
            <div className="brand-info">
              <h1 className="brand-title">KOSA</h1>
              <h2 className="main-title">
                쿠팡 제품 리뷰를<br />
                <span className="highlight">AI로 분석</span>해드립니다
              </h2>
            </div>
            
            <div className="search-section">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="검색할 제품 키워드 입력하세요"
                    className="search-input"
                  />
                  <button className="search-button">
                    🔍
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="illustration-content">
            <div className="hero-illustration">
              <Image
                src="/images/hero-illustration.svg"
                alt="KOSA AI 분석 일러스트레이션"
                width={600}
                height={400}
                priority
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hero-section {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          display: flex;
          align-items: center;
          padding: 2rem 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .text-content {
          color: #1e293b;
        }

        .brand-title {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: #3b82f6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .main-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 2rem;
          color: #0f172a;
        }

        .highlight {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .search-section {
          margin-top: 2rem;
        }

        .search-container {
          max-width: 500px;
        }

        .search-input-wrapper {
          display: flex;
          background: white;
          border-radius: 50px;
          padding: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(59, 130, 246, 0.1);
          transition: all 0.3s ease;
        }

        .search-input-wrapper:focus-within {
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.15);
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          background: transparent;
          color: #374151;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-button {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 50%;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .search-button:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .illustration-content {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .hero-illustration {
          position: relative;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
          animation: float 6s ease-in-out infinite;
        }

        .hero-image {
          max-width: 100%;
          height: auto;
          display: block;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .main-title {
            font-size: 2.5rem;
          }

          .brand-title {
            font-size: 1.5rem;
          }

          .search-input-wrapper {
            padding: 0.5rem;
          }

          .search-input {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .search-button {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-container {
            padding: 0 1rem;
          }

          .main-title {
            font-size: 2rem;
          }

          .brand-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;