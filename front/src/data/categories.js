// 카테고리 데이터는 이제 DB/API에서 불러옵니다.

import { Monitor, Shirt, Heart, Baby, UtensilsCrossed, Home, Dumbbell, Car, BookOpen, Gamepad2, ShoppingCart, PawPrint } from "lucide-react";

export const categories = [
  {
    label: "가전디지털",
    icon: <Monitor size={24} />,
    subcategories: [
      { name: "노트북", id: "laptop" },
      { name: "TV", id: "tv" },
      //{ name: "청소기", id: "vacuum" },
    ],
  },
  { label: "패션/잡화", 
    icon: <Shirt size={24} />,
    subcategories: [
      { name: "상의", id: "top",},
    ], 
  },
  { label: "뷰티", icon: <Heart size={24} /> },
  { label: "출산/유아동", icon: <Baby size={24} /> },
  { label: "식품", icon: <UtensilsCrossed size={24} /> },
  { label: "주방용품", icon: <ShoppingCart size={24} /> },
  { label: "생활용품", icon: <Home size={24} /> },
  { label: "홈인테리어", icon: <Home size={24} /> },
  { label: "스포츠/레저", icon: <Dumbbell size={24} /> },
  { label: "자동차용품", icon: <Car size={24} /> },
  { label: "도서/음반", icon: <BookOpen size={24} /> },
  { label: "완구/취미", icon: <Gamepad2 size={24} /> },
  { label: "문구/오피스", icon: <BookOpen size={24} /> },
  { label: "반려동물용품", icon: <PawPrint size={24} /> },
]; 