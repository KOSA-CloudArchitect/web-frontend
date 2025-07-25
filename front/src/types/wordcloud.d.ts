declare module 'wordcloud' {
  interface WordCloudOptions {
    list: Array<[string, number]>;
    gridSize?: number;
    weightFactor?: (size: number) => number;
    fontFamily?: string;
    color?: string | (() => string);
    rotateRatio?: number;
    rotationSteps?: number;
    backgroundColor?: string;
    drawOutOfBound?: boolean;
    shrinkToFit?: boolean;
  }

  function WordCloud(canvas: HTMLCanvasElement, options: WordCloudOptions): void;
  
  export = WordCloud;
}