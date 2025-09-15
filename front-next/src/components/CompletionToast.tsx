import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface CompletionToastProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

export const CompletionToast: React.FC<CompletionToastProps> = ({ 
  show, 
  onClose, 
  message = "분석이 완료되었습니다!" 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // 5초 후 자동 닫기
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 애니메이션 완료 후 onClose 호출
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : -100, 
            scale: isVisible ? 1 : 0.9 
          }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4">
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              >
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              </motion.div>
              
              <div className="flex-1">
                <motion.h4 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-semibold text-green-800 mb-1"
                >
                  분석 완료!
                </motion.h4>
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-green-700"
                >
                  {message}
                </motion.p>
              </div>
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* 진행 바 */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-green-500 rounded-full mt-3"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};