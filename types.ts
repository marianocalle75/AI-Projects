
export interface OCRResult {
  text: string;
  error?: string;
}

export interface ImagePreview {
  url: string;
  base64: string;
  mimeType: string;
}
