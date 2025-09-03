import {
  transformKeywordsForCloud,
  transformKeywordObjects,
  normalizeKeywords,
} from '../keywordUtils';

describe('keywordUtils', () => {
  describe('transformKeywordsForCloud', () => {
    it('문자열 배열을 KeywordData로 변환한다', () => {
      const keywords = ['품질', '배송', '품질', '가격', '품질'];
      const result = transformKeywordsForCloud(keywords);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ text: '품질', weight: 100 });
      expect(result[1].text).toBe('배송');
      expect(result[2].text).toBe('가격');
    });

    it('빈 배열을 처리한다', () => {
      const result = transformKeywordsForCloud([]);
      expect(result).toEqual([]);
    });

    it('잘못된 입력을 처리한다', () => {
      const result = transformKeywordsForCloud(null as any);
      expect(result).toEqual([]);
    });

    it('짧은 키워드를 필터링한다', () => {
      const keywords = ['a', 'ab', 'abc', 'abcd'];
      const result = transformKeywordsForCloud(keywords);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('abc');
      expect(result[1].text).toBe('abcd');
    });
  });

  describe('transformKeywordObjects', () => {
    it('객체 배열을 KeywordData로 변환한다', () => {
      const keywords = [
        { keyword: '품질', count: 10 },
        { keyword: '배송', weight: 8 },
        { keyword: '가격', count: 5 },
      ];
      const result = transformKeywordObjects(keywords);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ text: '품질', weight: 10 });
      expect(result[1]).toEqual({ text: '배송', weight: 8 });
      expect(result[2]).toEqual({ text: '가격', weight: 5 });
    });

    it('빈 배열을 처리한다', () => {
      const result = transformKeywordObjects([]);
      expect(result).toEqual([]);
    });
  });

  describe('normalizeKeywords', () => {
    it('문자열 배열을 정규화한다', () => {
      const data = ['품질', '배송', '품질'];
      const result = normalizeKeywords(data);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('weight');
    });

    it('객체 배열을 정규화한다', () => {
      const data = [{ keyword: '품질', count: 10 }];
      const result = normalizeKeywords(data);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ text: '품질', weight: 10 });
    });

    it('이미 정규화된 데이터를 처리한다', () => {
      const data = [{ text: '품질', weight: 80 }];
      const result = normalizeKeywords(data);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ text: '품질', weight: 80 });
    });

    it('null/undefined를 처리한다', () => {
      expect(normalizeKeywords(null)).toEqual([]);
      expect(normalizeKeywords(undefined)).toEqual([]);
    });
  });
});