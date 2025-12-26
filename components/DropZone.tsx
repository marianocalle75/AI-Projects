
import React, { useCallback, useState, useEffect } from 'react';

interface DropZoneProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onImageSelected, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelected(file);
    } else {
      alert('Please upload an image file.');
    }
  }, [onImageSelected]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile, isLoading]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragging(true);
  }, [isLoading]);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onPaste = useCallback((e: ClipboardEvent) => {
    if (isLoading) return;
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    }
  }, [handleFile, isLoading]);

  useEffect(() => {
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onPaste]);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-50' 
          : 'border-slate-300 bg-white hover:border-emerald-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        accept="image/*"
        disabled={isLoading}
      />
      
      <div className="text-center p-6 pointer-events-none">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Pega una captura de pantalla</h3>
        <p className="text-slate-500 mt-1">O arrastra y suelta una imagen aquí</p>
        <p className="text-xs text-slate-400 mt-4 uppercase tracking-wider font-medium">Soporta PNG, JPG, WEBP</p>
      </div>
    </div>
  );
};

export default DropZone;
