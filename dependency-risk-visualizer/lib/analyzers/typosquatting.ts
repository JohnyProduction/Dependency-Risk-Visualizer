import levenshtein from 'fast-levenshtein';

const POPULAR_PACKAGES = [
  'react', 'react-dom', 'next', 'vue', 'angular', 
  'express', 'lodash', 'axios', 'moment', 'commander',
  'chalk', 'tslib', 'rxjs', 'zone.js', 'typescript',
  'eslint', 'prettier', 'webpack', 'babel-core', 'jest'
];

export interface TyposquattingResult {
  isSuspicious: boolean;
  targetPackage?: string;
  distance?: number;
}

export function analyzeTyposquatting(packageName: string): TyposquattingResult {
  if (POPULAR_PACKAGES.includes(packageName)) {
    return { isSuspicious: false };
  }

  for (const popular of POPULAR_PACKAGES) {
    const distance = levenshtein.get(packageName, popular);
    
    if (distance > 0 && distance <= 2 && popular.length > 3) {
      return {
        isSuspicious: true,
        targetPackage: popular,
        distance: distance
      };
    }
  }

  return { isSuspicious: false };
}