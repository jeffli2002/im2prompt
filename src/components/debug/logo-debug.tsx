'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function LogoDebug() {
  const [imageStatus, setImageStatus] = useState<{
    imgTag: string;
    nextImage: string;
    directFetch: string;
  }>({
    imgTag: 'loading',
    nextImage: 'loading',
    directFetch: 'loading',
  });

  useEffect(() => {
    // Test direct fetch
    fetch('/images/logo3.png')
      .then((res) => {
        setImageStatus((prev) => ({
          ...prev,
          directFetch: `${res.status} ${res.statusText}`,
        }));
        return res.headers;
      })
      .then((headers) => {
        console.log('Direct fetch headers:', headers);
      })
      .catch((err) => {
        setImageStatus((prev) => ({
          ...prev,
          directFetch: `Error: ${err.message}`,
        }));
      });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Logo Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <p className="font-semibold">1. Standard img tag:</p>
          <img 
            src="/images/logo3.png" 
            alt="Test img" 
            width={32} 
            height={32}
            onLoad={() => setImageStatus(prev => ({ ...prev, imgTag: 'loaded' }))}
            onError={() => setImageStatus(prev => ({ ...prev, imgTag: 'error' }))}
          />
          <p>Status: {imageStatus.imgTag}</p>
        </div>
        
        <div>
          <p className="font-semibold">2. Next.js Image (unoptimized):</p>
          <Image 
            src="/images/logo3.png" 
            alt="Test Next Image" 
            width={32} 
            height={32}
            unoptimized
            onLoad={() => setImageStatus(prev => ({ ...prev, nextImage: 'loaded' }))}
            onError={() => setImageStatus(prev => ({ ...prev, nextImage: 'error' }))}
          />
          <p>Status: {imageStatus.nextImage}</p>
        </div>
        
        <div>
          <p className="font-semibold">3. Direct fetch test:</p>
          <p>Status: {imageStatus.directFetch}</p>
        </div>

        <div>
          <p className="font-semibold">4. Full path test:</p>
          <img 
            src={`${window.location.origin}/images/logo3.png`} 
            alt="Full path test" 
            width={32} 
            height={32}
          />
        </div>
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
      >
        Clear Cache & Reload
      </button>
    </div>
  );
}