'use client';

import { Share, Home, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BottomBar(): JSX.Element {
  const router = useRouter();
  
  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center items-center gap-8 bg-gray-100 py-3 shadow z-40">
      <button className="p-4 rounded-full shadow-lg bg-white flex items-center justify-center">
        <Share size={24} className="text-blue-600" />
      </button>
      <button className="p-4 rounded-full shadow-lg bg-white flex items-center justify-center" onClick={() => router.push('/') }>
        <Home size={28} className="text-blue-600" />
      </button>
      <button className="p-4 rounded-full shadow-lg bg-white flex items-center justify-center">
        <MessageCircle size={24} className="text-blue-600" />
      </button>
    </div>
  );
}