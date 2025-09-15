import React from 'react';

// 별점 컴포넌트
const STAR_PATH = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z";

const FullStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400" aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const EmptyStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-gray-300" aria-hidden>
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const HalfStar = ({ size = 12 }: { size?: number }) => {
  const id = `half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="text-yellow-400" aria-hidden>
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="currentColor" className="text-gray-300" />
      <g clipPath={`url(#${id})`}>
        <path d={STAR_PATH} fill="currentColor" />
      </g>
    </svg>
  );
};

export const renderStars = (rating: number) => {
  const roundedRating = Math.round(rating * 2) / 2;
  const full = Math.floor(roundedRating);
  const hasHalf = roundedRating % 1 === 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  const stars = [];
  for (let i = 0; i < full; i++) stars.push(<FullStar key={`f-${i}`} />);
  if (hasHalf) stars.push(<HalfStar key="h" />);
  for (let i = 0; i < empty; i++) stars.push(<EmptyStar key={`e-${i}`} />);

  return <div className="flex gap-0.5">{stars}</div>;
};
