import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import BottomBar from "../components/BottomBar";
import { Star } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { 
  Product, 
  AnalysisResult,
  ProductInfoProps,
  SentimentPieChartProps,
} from "../types";
import { apiService, ApiError } from "../services/api";

const sentimentColor = {
  all: "text-gray-800",
  positive: "text-blue-500",
  neutral: "text-gray-500",
  negative: "text-red-400"
} as const;

type SummaryFilter = keyof typeof sentimentColor;

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

function ProductInfo({ product }: ProductInfoProps): JSX.Element | null {
  if (!product) return null;
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow mb-4">
      <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
      <div>
        <div className="text-lg font-bold">{product.name}</div>
        <div className="text-sm text-gray-500">{product.brand}</div>
        <div className="text-blue-600 font-semibold mt-1">{product.price?.toLocaleString()}원</div>
        <div className="flex items-center gap-1 mt-1">
          <Star className="text-yellow-400" size={18} />
          <span className="font-semibold">{product.rating}</span>
          <span className="text-gray-400 text-xs">({product.review_count}개 리뷰)</span>
        </div>
      </div>
    </div>
  );
}

function SentimentPieChart({ positive = 65, neutral = 20, negative = 15 }: SentimentPieChartProps): JSX.Element {
  const data: PieChartData[] = [
    { name: "긍정", value: positive, color: "#60a5fa" },
    { name: "중립", value: neutral, color: "#a3a3a3" },
    { name: "부정", value: negative, color: "#f87171" }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center mb-6">
      <div className="font-bold mb-2">감정 분석</div>
      <PieChart width={180} height={180}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={2}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      <div className="flex gap-3 mt-2 text-sm">
        <span className="text-blue-500">긍정 {positive}%</span>
        <span className="text-gray-500">중립 {neutral}%</span>
        <span className="text-red-400">부정 {negative}%</span>
      </div>
    </div>
  );
}

export default function ResultPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>("all");

  useEffect(() => {
    if (!id) {
      setError("상품 ID가 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    Promise.all([
      apiService.getProduct(id),
      apiService.getAnalysisResult(id)
    ])
      .then(([productData, analysisResult]) => {
        setProduct(productData);
        if (analysisResult.status === "completed" && analysisResult.result) {
          setAnalysisData(analysisResult.result);
        } else if (analysisResult.status === "failed") {
          setError("분석에 실패했습니다. 다시 시도해주세요.");
        } else {
          setError("분석 결과를 불러오는데 실패했습니다.");
        }
        setLoading(false);
      })
      .catch((err: ApiError | Error) => {
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [id]);

  const getSummaryText = (): string => {
    if (!analysisData) return "요약 정보가 없습니다.";
    
    switch (summaryFilter) {
      case "all":
        return analysisData.summary || "전체 요약 정보가 없습니다.";
      case "positive":
        return "긍정적인 리뷰 요약 정보가 없습니다."; // 실제 데이터 구조에 맞게 수정 필요
      case "neutral":
        return "중립적인 리뷰 요약 정보가 없습니다."; // 실제 데이터 구조에 맞게 수정 필요
      case "negative":
        return "부정적인 리뷰 요약 정보가 없습니다."; // 실제 데이터 구조에 맞게 수정 필요
      default:
        return "요약 정보가 없습니다.";
    }
  };

  // 감정 분석 데이터 (실제 데이터가 있으면 사용, 없으면 기본값)
  const sentimentData = analysisData?.sentiment || { positive: 65, negative: 15, neutral: 20 };

  if (loading) {
    return (
      <>
        <NavBar title="KOSA" />
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">분석 결과를 불러오는 중입니다</h2>
            <p className="text-gray-600 mb-6">잠시만 기다려주세요...</p>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar title="KOSA" />
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              다시 시도
            </button>
          </div>
        </div>
        <BottomBar />
      </>
    );
  }

  return (
    <>
      <NavBar title="KOSA" />
      <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen pt-16 pb-24">
        <ProductInfo product={product} />
        <SentimentPieChart 
          positive={sentimentData.positive} 
          neutral={sentimentData.neutral} 
          negative={sentimentData.negative} 
        />
        <div className="flex gap-2 mb-4">
          {(["all", "positive", "neutral", "negative"] as const).map(type => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                summaryFilter === type ? "bg-blue-500 text-white" : "bg-white text-gray-500"
              }`}
              onClick={() => setSummaryFilter(type)}
            >
              {type === "all" ? "전체" : type === "positive" ? "긍정" : type === "neutral" ? "중립" : "부정"}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className={`text-lg font-bold mb-4 ${sentimentColor[summaryFilter]}`}>
            {summaryFilter === "all"
              ? "리뷰 전체 요약"
              : summaryFilter === "positive"
              ? "긍정 분석"
              : summaryFilter === "neutral"
              ? "중립 분석"
              : "부정 분석"}
          </h2>
          <div className="text-gray-800 mb-6 whitespace-pre-line">{getSummaryText()}</div>
        </div>
      </div>
      <BottomBar />
    </>
  );
}