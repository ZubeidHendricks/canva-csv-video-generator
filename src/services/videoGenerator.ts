import { CSVData, VideoConfig, GeneratedVideo, ChartData } from '../types';
import { videoTemplates } from '../config/templates';

class VideoGenerator {
  async generateVideos(
    csvData: CSVData,
    config: VideoConfig
  ): Promise<GeneratedVideo[]> {
    const videos: GeneratedVideo[] = [];
    
    // Generate a video for each row of data
    for (let i = 0; i < Math.min(csvData.rows.length, 10); i++) {
      const row = csvData.rows[i];
      const video = await this.generateVideoForRow(row, csvData, config, i);
      videos.push(video);
    }
    
    return videos;
  }

  private async generateVideoForRow(
    row: Record<string, any>,
    csvData: CSVData,
    config: VideoConfig,
    index: number
  ): Promise<GeneratedVideo> {
    const template = videoTemplates.find(t => t.id === config.template) || videoTemplates[0];
    
    // Generate chart data from the row
    const chartData = this.createChartData(row, csvData, config);
    
    // Generate title and description
    const title = this.generateTitle(row, csvData, index);
    const description = this.generateDescription(row, csvData);
    
    // Generate narration script
    const narrationScript = config.includeNarration 
      ? this.generateNarrationScript(row, csvData, chartData)
      : '';
    
    const video: GeneratedVideo = {
      id: `video_${index + 1}`,
      title,
      description,
      duration: config.duration,
      format: config.format,
      chartData,
      narrationScript,
      rowData: row
    };
    
    return video;
  }

  private createChartData(
    row: Record<string, any>,
    csvData: CSVData,
    config: VideoConfig
  ): ChartData {
    // Find numeric columns for chart data
    const numericColumns = csvData.headers.filter(header => {
      const value = row[header];
      return typeof value === 'number' || !isNaN(Number(value));
    });
    
    // Use first numeric column as primary data
    const primaryColumn = numericColumns[0] || csvData.headers[1] || csvData.headers[0];
    const labelColumn = csvData.headers.find(h => h !== primaryColumn) || csvData.headers[0];
    
    const labels = [String(row[labelColumn] || `Item ${Object.keys(row).indexOf(primaryColumn) + 1}`)];
    const values = [Number(row[primaryColumn]) || 0];
    
    // Add comparison data from other rows for context
    const contextData = csvData.rows
      .filter((_, i) => i !== csvData.rows.indexOf(row))
      .slice(0, 4)
      .map(contextRow => ({
        label: String(contextRow[labelColumn] || 'Other'),
        value: Number(contextRow[primaryColumn]) || 0
      }));
    
    // Combine current row with context
    const allLabels = [labels[0], ...contextData.map(d => d.label)];
    const allValues = [values[0], ...contextData.map(d => d.value)];
    
    // Generate colors based on template
    const template = videoTemplates.find(t => t.id === config.template) || videoTemplates[0];
    const baseColor = config.accentColor || template.style.accentColor;
    const colors = this.generateColors(allValues.length, baseColor);
    
    const chartData: ChartData = {
      id: `chart_${Date.now()}`,
      type: config.chartType,
      title: `${primaryColumn} Analysis`,
      description: `Data visualization for ${labelColumn} vs ${primaryColumn}`,
      data: {
        labels: allLabels,
        datasets: [{
          label: primaryColumn,
          data: allValues,
          backgroundColor: colors,
          borderColor: colors.map(color => this.darkenColor(color, 0.2)),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${primaryColumn} by ${labelColumn}`
          },
          legend: {
            display: config.chartType === 'pie' || config.chartType === 'doughnut'
          }
        },
        scales: config.chartType === 'pie' ? {} : {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    
    return chartData;
  }

  private generateTitle(
    row: Record<string, any>,
    csvData: CSVData,
    index: number
  ): string {
    // Try to create a meaningful title from the data
    const firstColumn = csvData.headers[0];
    const firstValue = row[firstColumn];
    
    if (firstValue) {
      return `${firstColumn}: ${firstValue}`;
    }
    
    return `Data Analysis ${index + 1}`;
  }

  private generateDescription(
    row: Record<string, any>,
    csvData: CSVData
  ): string {
    const descriptions: string[] = [];
    
    // Add key data points
    csvData.headers.slice(0, 3).forEach(header => {
      const value = row[header];
      if (value !== null && value !== undefined && value !== '') {
        descriptions.push(`${header}: ${value}`);
      }
    });
    
    return descriptions.join(' • ');
  }

  private generateNarrationScript(
    row: Record<string, any>,
    csvData: CSVData,
    chartData: ChartData
  ): string {
    const scripts: string[] = [];
    
    // Introduction
    scripts.push(`Let's examine the data for ${chartData.title}.`);
    
    // Key values
    const numericValues = Object.entries(row)
      .filter(([_, value]) => typeof value === 'number' || !isNaN(Number(value)))
      .slice(0, 2);
    
    numericValues.forEach(([key, value]) => {
      scripts.push(`The ${key} shows a value of ${Number(value).toLocaleString()}.`);
    });
    
    // Conclusion
    scripts.push('This visualization helps us understand the data patterns and trends.');
    
    return scripts.join(' ');
  }

  private generateColors(count: number, baseColor: string): string[] {
    const colors: string[] = [];
    const baseHue = this.hexToHsl(baseColor).h;
    
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + (i * 360 / count)) % 360;
      const saturation = 70;
      const lightness = 50 + (i % 2) * 10; // Alternate lightness
      colors.push(this.hslToHex(hue, saturation, lightness));
    }
    
    return colors;
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Convert hex to RGB first
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (c: number): string => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private darkenColor(hex: string, factor: number): string {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.max(0, hsl.l - (hsl.l * factor));
    return this.hslToHex(hsl.h, hsl.s, hsl.l);
  }
}

export const videoGenerator = new VideoGenerator();