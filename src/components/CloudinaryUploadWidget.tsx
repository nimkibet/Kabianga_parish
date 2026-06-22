'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  className?: string;
  croppingAspectRatio?: number;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  buttonText = 'Upload Image',
  className = '',
  croppingAspectRatio,
}: CloudinaryUploadWidgetProps) {
  const [loaded, setLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.cloudinary) {
      setLoaded(true);
    }
  }, []);

  const initializeWidget = () => {
    if (!window.cloudinary) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary cloud name or upload preset is not configured. Please check your environment variables.');
      return;
    }

    const widgetConfig: any = {
      cloudName,
      uploadPreset,
      sources: ['local', 'camera', 'url'],
      multiple: false,
      styles: {
        palette: {
          window: '#FAF5FF',
          windowBorder: '#DDD6FE',
          tabIcon: '#7C3AED',
          menuIcons: '#4C1D95',
          textDark: '#1E1B4B',
          textLight: '#FFFFFF',
          link: '#7C3AED',
          action: '#16A34A',
          inactiveTabIcon: '#A78BFA',
          error: '#DC2626',
          inProgress: '#7C3AED',
          complete: '#16A34A',
          sourceBg: '#FAF5FF',
        },
      },
    };

    if (croppingAspectRatio !== undefined) {
      widgetConfig.cropping = true;
      widgetConfig.croppingAspectRatio = croppingAspectRatio;
      widgetConfig.showSkipCropButton = true;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      widgetConfig,
      (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary upload widget error:', error);
          return;
        }
        if (result && result.event === 'success') {
          const secureUrl = result.info.secure_url;
          onUploadSuccess(secureUrl);
        }
      }
    );
  };

  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      initializeWidget();
      if (widgetRef.current) {
        widgetRef.current.open();
      } else {
        // Fallback if initializeWidget failed
        setTimeout(() => {
          initializeWidget();
          widgetRef.current?.open();
        }, 100);
      }
    }
  };

  return (
    <>
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        onLoad={() => {
          setLoaded(true);
        }}
        strategy="afterInteractive"
      />
      <button
        type="button"
        disabled={!loaded}
        onClick={openWidget}
        className={`touch-target px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loaded ? buttonText : 'Uploader Loading...'}
      </button>
    </>
  );
}
