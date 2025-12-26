
import React, { useState, useCallback } from 'react';
import DropZone from './components/DropZone';
import ResultDisplay from './components/ResultDisplay';
import { performArabicOCR } from './services/geminiService';
import { ImagePreview } from './types';

const App: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    setExtractedText('');

    try {
      // 1. Create preview and base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      
      const fullBase64 = await base64Promise;
      const base64Data = fullBase64.split(',')[1];
      
      setImagePreview({
        url: fullBase64,
        base64: base64Data,
        mimeType: file.type
      });

      // 2. Perform OCR
      const text = await performArabicOCR(base64Data, file.type);
      setExtractedText(text);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la imagen.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Arabic <span className="text-emerald-600">OCR</span> Master
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span>Powered by Gemini Flash</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Reconocimiento de Texto Árabe</h2>
          <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
            Pega una captura de pantalla directamente o sube una imagen para extraer el texto en segundos con alta precisión.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Uploader Section */}
          <section>
            <DropZone onImageSelected={handleImageSelected} isLoading={isLoading} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </section>

          {/* Processing / Preview Section */}
          {(imagePreview || isLoading) && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left: Original Image */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Imagen Original</h3>
                  {imagePreview ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-100">
                      <img 
                        src={imagePreview.url} 
                        alt="Preview" 
                        className="w-full h-auto object-contain max-h-[400px]"
                      />
                      {isLoading && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-white font-medium">Extrayendo texto...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[200px] bg-slate-100 animate-pulse rounded-lg" />
                  )}
                </div>

                {/* Right: Results */}
                {extractedText && (
                   <div className="md:mt-0">
                      <ResultDisplay text={extractedText} />
                   </div>
                )}
              </div>
            </section>
          )}

          {/* Simple Result Display fallback for mobile if it grows long */}
          {extractedText && !imagePreview && (
            <ResultDisplay text={extractedText} />
          )}
        </div>
      </main>

      {/* Instructions footer */}
      <footer className="mt-20 border-t border-slate-200 pt-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">¿Cómo funciona?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mb-3">1</div>
              <p className="text-sm text-slate-600">Captura la pantalla (Cmd+Ctrl+Shift+4 en Mac o Win+Shift+S en Windows)</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mb-3">2</div>
              <p className="text-sm text-slate-600">Haz clic en la zona punteada y pulsa Ctrl+V (o Cmd+V)</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mb-3">3</div>
              <p className="text-sm text-slate-600">Copia el texto plano resultante directamente a tu portapapeles</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
