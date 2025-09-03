import { useState, useEffect } from "react";
import CategoryList from "./CategoryList";
import SubcategoryList from "./SubcategoryList";

export default function CategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://kosa-backend-315281980252.asia-northeast3.run.app/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        setError("카테고리 불러오기 실패");
        setLoading(false);
      });
  }, []);

  // 메인 카테고리만 추출
  const mainCategories = categories.filter(cat => cat.parent_id === null || cat.depth === 0);
  // 서브카테고리 추출 함수
  function getSubcategories(parentId) {
    return categories.filter(cat => cat.parent_id === parentId);
  }

  if (loading) return <div className="p-8 text-center text-gray-400">카테고리 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (selectedCategory) {
    const subcategories = getSubcategories(selectedCategory.id);
    return (
      <SubcategoryList
        category={selectedCategory}
        subcategories={subcategories}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return <CategoryList categories={mainCategories} onSelect={setSelectedCategory} />;
} 