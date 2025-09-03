import { KeywordData } from '../components/KeywordCloud';

/**
 * API 응답 키워드 데이터를 워드클라우드 형식으로 변환
 */
export const transformKeywordsForCloud = (keywords: string[]): KeywordData[] => {
  if (!Array.isArray(keywords)) {
    return [];
  }

  // 키워드 빈도 계산
  const keywordFrequency = keywords.reduce((acc, keyword) => {
    const cleanKeyword = keyword.trim().toLowerCase();
    if (cleanKeyword && cleanKeyword.length > 2) { // 3글자 이상만 허용
      acc[cleanKeyword] = (acc[cleanKeyword] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 빈도를 기반으로 가중치 계산 (1-100 범위)
  const maxFrequency = Math.max(...Object.values(keywordFrequency));
  const minFrequency = Math.min(...Object.values(keywordFrequency));
  const range = maxFrequency - minFrequency || 1;

  return Object.entries(keywordFrequency)
    .map(([text, frequency]) => ({
      text,
      weight: Math.round(((frequency - minFrequency) / range) * 80 + 20), // 20-100 범위
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 50); // 최대 50개 키워드만 표시
};

/**
 * 키워드 배열이 객체 형태로 올 경우 변환
 */
export const transformKeywordObjects = (
  keywords: Array<{ keyword: string; count?: number; weight?: number }>
): KeywordData[] => {
  if (!Array.isArray(keywords)) {
    return [];
  }

  return keywords
    .map(item => ({
      text: item.keyword?.trim() || '',
      weight: item.weight || item.count || 1,
    }))
    .filter(item => item.text.length > 2)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 50);
};

/**
 * 키워드 데이터 정규화 (다양한 형식 지원)
 */
export const normalizeKeywords = (data: any): KeywordData[] => {
  if (!data) return [];

  // 문자열 배열인 경우
  if (Array.isArray(data) && typeof data[0] === 'string') {
    return transformKeywordsForCloud(data);
  }

  // 객체 배열인 경우
  if (Array.isArray(data) && typeof data[0] === 'object') {
    return transformKeywordObjects(data);
  }

  // 이미 KeywordData 형식인 경우
  if (Array.isArray(data) && data.length > 0 && data[0]?.text && typeof data[0]?.weight === 'number') {
    return data.slice(0, 50);
  }

  return [];
};