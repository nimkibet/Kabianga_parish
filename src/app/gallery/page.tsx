'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Image as GalleryIcon, X, Eye, Info } from 'lucide-react';

interface GalleryImage {
  id?: string;
  image_url: string;
  caption?: string;
  category: string;
}

const DEFAULT_IMAGES: GalleryImage[] = [
  {
    image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=800',
    caption: 'Parish Choir leading worship during our Easter celebration.',
    category: 'Choir',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1526976729451-9922bc9a680b?auto=format&fit=crop&q=80&w=800',
    caption: 'Youth fellowship gathering for fellowship and peer mentorship.',
    category: 'Youth',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
    caption: 'ACK Kabianga Sunday School class learning through play and music.',
    category: 'Sunday School',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    caption: 'Community outreach program providing food hampers to families.',
    category: 'Community',
  },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(DEFAULT_IMAGES);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setImages(data);
        }
      } catch (err) {
        console.error('Error fetching gallery images:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  // Extract unique categories (always include 'All')
  const categories = ['All', ...Array.from(new Set(images.map((img) => img.category || 'General')))];

  // Filtered images list
  const filteredImages = activeCategory === 'All'
    ? images
    : images.filter((img) => (img.category || 'General') === activeCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-border pb-4 space-y-2">
        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full">
          <GalleryIcon className="w-3.5 h-3.5" />
          <span>Gallery Showcase</span>
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Photo Gallery</h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Visual glimpses into the community, ministries, and events at ACK Kabianga Parish.
        </p>
      </div>

      {/* Category Pills (Touch targets >= 44x44px implicitly via flex-wrap and padding) */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`touch-target px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'bg-card text-foreground/80 hover:bg-muted border border-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-card">
          <GalleryIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-bold text-foreground">No photos found</h3>
          <p className="text-sm text-muted-foreground mt-1">This category does not have any pictures yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image, idx) => (
            <div
              key={image.id || idx}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border/60 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            >
              {/* Image */}
              <img
                src={image.image_url}
                alt={image.caption || 'Gallery Image'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Hover/Tap Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="text-white space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-accent/90 px-2 py-0.5 rounded">
                    {image.category || 'General'}
                  </span>
                  {image.caption && (
                    <p className="text-xs font-medium line-clamp-2 leading-relaxed">
                      {image.caption}
                    </p>
                  )}
                  <div className="flex items-center text-[10px] font-semibold text-purple-200 pt-1">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span>View fullscreen</span>
                  </div>
                </div>
              </div>

              {/* Mobile-only visible info trigger bar */}
              <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white md:hidden z-10">
                <Info className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal (Accessible full-screen preview with swipe-away mindset and large close trigger) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-between items-center p-4 md:p-8 animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Header Bar */}
          <div className="w-full max-w-4xl flex justify-between items-center text-white pb-2 z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/25 px-3 py-1.5 rounded-full border border-accent/30">
              {selectedImage.category || 'General'}
            </span>
            <button
              onClick={() => setSelectedImage(null)}
              className="touch-target w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95"
              aria-label="Close photo overlay"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Large Image Container */}
          <div 
            className="flex-1 w-full max-w-4xl flex items-center justify-center relative my-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when tapping the image itself
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.caption || 'Enlarged view'}
              className="max-w-full max-h-[70vh] md:max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Caption / Footer details */}
          <div 
            className="w-full max-w-4xl bg-white/5 border border-white/10 p-5 rounded-2xl text-white backdrop-blur-md z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-semibold text-purple-200">Description</h4>
            <p className="mt-1 text-sm sm:text-base leading-relaxed text-slate-100">
              {selectedImage.caption || 'No description provided for this photo.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
