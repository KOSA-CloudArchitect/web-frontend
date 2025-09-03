import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SubcategoryList({ category, subcategories, onBack }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-full max-w-md mx-auto mt-8 rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <button onClick={onBack} className="mr-2 text-blue-600"><ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /></button>
        <span className="text-2xl font-bold text-blue-600">{category.name || category.label}</span>
      </div>
      <ul>
        {subcategories && subcategories.length > 0 ? (
          subcategories.map((sub, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-6 py-4 border-b last:border-b-0 group cursor-pointer transition-all hover:bg-blue-50"
              onClick={() => navigate(`/search?query=${sub.name}`)}
            >
              <span className="flex-1 text-lg font-semibold text-gray-900">{sub.name}</span>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-400 transition" />
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-center text-gray-400">하위 카테고리가 없습니다.</li>
        )}
      </ul>
    </div>
  );
} 