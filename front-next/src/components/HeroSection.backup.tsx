"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ShoppingBag, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
    
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Icons */}
        <motion.div
          className="absolute top-20 left-10 text-white/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star size={40} />
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 text-white/15"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <ShoppingBag size={32} />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 text-white/25"
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <TrendingUp size={36} />
        </motion.div>
        
        {/* Gradient Circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              진짜 리뷰만 골라내는
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                스마트한 쇼핑의 시작
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              AI가 수천 개의 리뷰를 분석해서<br />
              정말 중요한 정보만 알려드립니다
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className="max-w-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-2xl">
                <input
                  type="text"
                  placeholder="어떤 제품을 찾으세요?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-6 py-4 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-lg"
                />
                <motion.button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Search className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              지금 시작하기
            </motion.button>
          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Phone Shadow */}
              <div className="absolute inset-0 bg-black/20 blur-3xl transform translate-x-8 translate-y-8 rounded-3xl"></div>
              
              {/* Phone Mockup */}
              <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl transform perspective-1000 rotateY-[-15deg]">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Phone Screen Content */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white p-8">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                      <div className="text-xs font-semibold">9:41</div>
                      <div className="w-6 h-3 bg-black rounded-sm"></div>
                    </div>
                    
                    {/* App Content */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <Search className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">AI 리뷰 분석</h3>
                        <p className="text-xs text-gray-600">똑똑한 쇼핑 도우미</p>
                      </div>
                      
                      {/* Sample Cards */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium">긍정적 의견</span>
                          </div>
                          <p className="text-xs text-gray-600">성능이 우수하고 가성비가 좋음</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs font-medium">개선점</span>
                          </div>
                          <p className="text-xs text-gray-600">배송이 조금 느린 편</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium">종합 평가</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className={`w-3 h-3 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs ml-1">4.2/5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm">스크롤하여 더보기</span>
          <div className="w-0.5 h-8 bg-white/40 rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;