export interface CSVData {
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
  rowCount: number;
}

export interface VideoConfig {
  template: string;
  duration: number; // seconds
  format: '16:9' | '9:16' | '1:1';
  includeNarration: boolean;
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface DataMapping {
  xAxis?: string;
  yAxis?: string;
  category?: string;
  value?: string;
  label?: string;
  time?: string;
}

export interface GeneratedVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  format: string;
  chartData: ChartData;
  narrationScript: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  rowData: Record<string, any>;
}

export interface ChartData {
  type: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  options: any;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  style: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    layout: 'minimal' | 'detailed' | 'creative';
  };
  animation: {
    chartEntry: 'fade' | 'slide' | 'bounce';
    textEntry: 'typewriter' | 'fade' | 'slide';
    transition: 'smooth' | 'cut' | 'wipe';
  };
}

export interface NarrationConfig {
  voice: 'male' | 'female' | 'neutral';
  speed: 'slow' | 'normal' | 'fast';
  language: string;
  includeNumbers: boolean;
  includeContext: boolean;
}