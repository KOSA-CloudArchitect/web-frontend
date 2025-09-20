"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlayioHeroSectionProps {
  onSearch?: (query: string) => void;
}

const PlayioHeroSection: React.FC<PlayioHeroSectionProps> = ({ onSearch }) => {
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
    <section className="h-screen flex items-center relative overflow-hidden pt-16" style={{
      background: 'linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%)'
    }}>
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
        
        {/* Floating Orange Circles */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-orange-400 rounded-full opacity-80"></div>
        <div className="absolute top-40 right-40 w-16 h-16 bg-yellow-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-40 right-60 w-24 h-24 bg-orange-300 rounded-full opacity-70"></div>
        <div className="absolute bottom-20 left-40 w-20 h-20 bg-yellow-300 rounded-full opacity-50"></div>
        <div className="absolute top-1/2 right-10 w-12 h-12 bg-orange-500 rounded-full opacity-60"></div>
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
              <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                스마트한 쇼핑의 시작
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              AI가 수천 개의 리뷰를 분석해서<br />
              정말 중요한 정보만 알려드립니다
            </motion.p>

            {/* CTA Button */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                className="bg-gradient-to-r from-orange-400 to-yellow-400 text-black px-8 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                지금 시작하기
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

          </motion.div>

          {/* Right Content - Phone Mockup */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="relative perspective-1000"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ 
                scale: 1.05,
                rotateY: -12,
                rotateX: 3,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              style={{ perspective: '1000px' }}
            >
              {/* Enhanced 3D Shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/10 blur-3xl transform translate-x-12 translate-y-12 rounded-3xl scale-110"></div>
              
              {/* Phone Mockup with 3D Transform */}
              <div 
                className="relative w-72 h-[540px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl phone-mockup transform-gpu"
                style={{ 
                  transform: 'rotateY(-8deg) rotateX(2deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Phone Side Edge */}
                <div 
                  className="absolute top-2 -right-2 w-2 h-[532px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-r-[3rem]"
                  style={{ 
                    transform: 'rotateY(90deg) translateZ(-1px)',
                    transformOrigin: 'left center'
                  }}
                >
                  {/* Volume Buttons */}
                  <div className="absolute top-20 left-0 w-full h-8 bg-gray-600 rounded-r-sm"></div>
                  <div className="absolute top-32 left-0 w-full h-4 bg-gray-600 rounded-r-sm"></div>
                  <div className="absolute top-40 left-0 w-full h-4 bg-gray-600 rounded-r-sm"></div>
                </div>
                
                {/* Phone Bottom Edge */}
                <div 
                  className="absolute bottom-0 left-2 w-[280px] h-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-b-[3rem]"
                  style={{ 
                    transform: 'rotateX(90deg) translateZ(-1px)',
                    transformOrigin: 'center top'
                  }}
                >
                  {/* USB-C Port */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-900 rounded-full"></div>
                </div>

                {/* Camera Bump (Back) */}
                <div 
                  className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl"
                  style={{ 
                    transform: 'translateZ(-3px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="absolute top-2 left-2 w-3 h-3 bg-gray-900 rounded-full"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-gray-900 rounded-full"></div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rounded-full"></div>
                </div>

                {/* Screen with slight 3D effect */}
                <div 
                  className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative shadow-inner"
                  style={{ 
                    transform: 'translateZ(2px)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Phone Screen Content */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white p-6"
                    style={{ 
                      transform: 'translateZ(1px)',
                    }}
                  >
                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                      <div className="text-xs font-semibold">9:41</div>
                      <div className="w-6 h-3 bg-black rounded-sm"></div>
                    </div>
                    
                    {/* Review Analysis App Content */}
                    <div className="space-y-3">
                      {/* Product Header */}
                      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-300 rounded-full opacity-30"></div>
                        <div className="relative z-10">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-white/30 flex items-center justify-center backdrop-blur-sm">
                              <span className="text-lg">📱</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-sm">아이폰 17 air</h3>
                              <p className="text-xs text-white/80">AI 리뷰 분석 완료</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-white">
                              <span className="text-lg font-bold">⭐ 4.7</span>
                              <span className="text-sm ml-1">(2,341개)</span>
                            </div>
                            <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                              분석보기
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sentiment Analysis Pie Chart */}
                      <div className="bg-white rounded-xl p-3 relative overflow-hidden border border-gray-100">
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-800">감정 분석</h4>
                            <span className="text-xs text-gray-500">AI 분석</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {/* Simple Pie Chart */}
                            <div className="relative w-14 h-14">
                              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="transparent"
                                  stroke="#e5e7eb"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="transparent"
                                  stroke="#10b981"
                                  strokeWidth="3"
                                  strokeDasharray="67 33"
                                  strokeDashoffset="0"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="transparent"
                                  stroke="#f59e0b"
                                  strokeWidth="3"
                                  strokeDasharray="20 80"
                                  strokeDashoffset="-67"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="transparent"
                                  stroke="#ef4444"
                                  strokeWidth="3"
                                  strokeDasharray="13 87"
                                  strokeDashoffset="-87"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">긍정</span>
                                </div>
                                <span className="text-xs font-medium">67%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">중립</span>
                                </div>
                                <span className="text-xs font-medium">20%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">부정</span>
                                </div>
                                <span className="text-xs font-medium">13%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Cards */}
                      <div className="space-y-1.5">
                        {/* Positive Review Card */}
                        <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs">😊</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="text-xs font-medium text-green-700">김○○</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400 text-xs">⭐</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                카메라 성능이 정말 뛰어나고 배터리도 오래가요. 특히 야간 촬영이 인상적입니다.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Negative Review Card */}
                        <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs">😔</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="text-xs font-medium text-red-700">박○○</span>
                                <div className="flex">
                                  {[...Array(3)].map((_, i) => (
                                    <span key={i} className="text-yellow-400 text-xs">⭐</span>
                                  ))}
                                  {[...Array(2)].map((_, i) => (
                                    <span key={i} className="text-gray-300 text-xs">⭐</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                가격이 너무 비싸고 발열이 좀 있어요. 케이스 필수입니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Navigation */}
                      <div className="flex justify-between items-center px-1">
                        {['분석', '리뷰', '비교', '관심'].map((item, index) => (
                          <div key={index} className="flex flex-col items-center space-y-1">
                            <div className={`w-5 h-5 rounded ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <span className={`text-[10px] ${index === 0 ? 'text-blue-500' : 'text-gray-400'}`}>{item}</span>
                          </div>
                        ))}
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
        className="absolute bottom-8 left-8 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <span className="text-sm font-medium">Scroll</span>
        </div>
      </motion.div>
    </section>
  );
};

export default PlayioHeroSection;