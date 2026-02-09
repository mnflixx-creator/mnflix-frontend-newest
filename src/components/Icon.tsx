/**
 * Icon component stub - P-Stream specific component
 * Not needed for MNFLIX
 */

export interface IconProps {
  className?: string;
  icon?: string;
  [key: string]: any;
}

export function Icon(_props: IconProps) {
  return null;
}

// Mock icon set
export const Icons = {
  MOVIE: 'movie',
  TV: 'tv',
  BOOKMARK: 'bookmark',
  // Add more as needed
};
