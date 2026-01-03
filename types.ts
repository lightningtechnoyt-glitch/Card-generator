
export type ThemeType = 'luxury' | 'minimalist' | 'scholar' | 'serene' | 'organic' | 'technical' | 'mono' | 'blueprint' | 'sketch';
export type TagSize = 'small' | 'medium' | 'large';
export type PageSize = 'A4' | 'Letter' | 'A5';
export type PrintMode = 'color' | 'bw';

export interface SubjectItem {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface PageLayout {
  id: string;
  tagIds: string[];
}

export interface AppState {
  userName: string;
  className: string;
  theme: ThemeType;
  tagSize: TagSize;
  pageSize: PageSize;
  tagGap: number;
  showCuttingGuides: boolean;
  subjects: SubjectItem[];
  pages: PageLayout[];
  globalQuote: string;
  companyName: string;
  accentColor: string;
  isDarkMode: boolean;
  printMode: PrintMode;
}

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  style: string;
  mode: PrintMode;
}
