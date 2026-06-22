'use client';

import { useState, useEffect } from 'react';
import { 
  supabase 
} from '@/lib/supabase';
import { 
  Lock, 
  Mail, 
  Sliders, 
  BookOpen, 
  Image as GalleryIcon, 
  LogOut, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Calendar
} from 'lucide-react';
import CloudinaryUploadWidget from '@/components/CloudinaryUploadWidget';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Authentication form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'carousel' | 'history' | 'gallery'>('carousel');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data states
  const [slides, setSlides] = useState<any[]>([]);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Form inputs state
  // Carousel Form
  const [slideTitle, setSlideTitle] = useState('');
  const [slideQuote, setSlideQuote] = useState('');
  const [slideImageUrl, setSlideImageUrl] = useState('');
  
  // History Form
  const [historyYear, setHistoryYear] = useState('');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyContent, setHistoryContent] = useState('');
  const [historyImageUrl, setHistoryImageUrl] = useState('');
  
  // Gallery Form
  const [galleryCategory, setGalleryCategory] = useState('General');
  const [galleryCustomCategory, setGalleryCustomCategory] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  // Theme Settings state
  const [themeName, setThemeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [secondaryColor, setSecondaryColor] = useState('#a78bfa');
  const [backgroundColor, setBackgroundColor] = useState('#faf5ff');
  const [foregroundColor, setForegroundColor] = useState('#1e1b4b');
  const [startMonth, setStartMonth] = useState('1');
  const [endMonth, setEndMonth] = useState('12');

  // Track session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data depending on session and activeTab
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session, activeTab]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      if (activeTab === 'carousel') {
        const { data, error } = await supabase
          .from('carousel_slides')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        setSlides(data || []);
      } else if (activeTab === 'history') {
        const { data, error } = await supabase
          .from('history_entries')
          .select('*')
          .order('year', { ascending: true });
        if (error) throw error;
        setHistoryEntries(data || []);
      } else if (activeTab === 'gallery') {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setGalleryImages(data || []);
      }
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      showNotification('error', `Failed to load items: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Carousel Submit
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImageUrl) {
      showNotification('error', 'Please upload an image first.');
      return;
    }
    try {
      const displayOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order || 0)) + 1 : 0;
      const { error } = await supabase.from('carousel_slides').insert({
        title: slideTitle,
        quote: slideQuote,
        image_url: slideImageUrl,
        display_order: displayOrder,
      });

      if (error) throw error;

      showNotification('success', 'Carousel slide added successfully!');
      setSlideTitle('');
      setSlideQuote('');
      setSlideImageUrl('');
      fetchData();
    } catch (err: any) {
      showNotification('error', `Failed to save slide: ${err.message}`);
    }
  };

  // History Submit
  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    const yearNum = parseInt(historyYear);
    if (isNaN(yearNum)) {
      showNotification('error', 'Please enter a valid numeric year.');
      return;
    }
    try {
      const { error } = await supabase.from('history_entries').insert({
        year: yearNum,
        title: historyTitle,
        content: historyContent,
        image_url: historyImageUrl || null,
      });

      if (error) throw error;

      showNotification('success', 'History entry added successfully!');
      setHistoryYear('');
      setHistoryTitle('');
      setHistoryContent('');
      setHistoryImageUrl('');
      fetchData();
    } catch (err: any) {
      showNotification('error', `Failed to save history entry: ${err.message}`);
    }
  };

  // Gallery Submit
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImageUrl) {
      showNotification('error', 'Please upload a gallery image first.');
      return;
    }
    const finalCategory = galleryCategory === 'Custom' ? galleryCustomCategory : galleryCategory;
    if (!finalCategory.trim()) {
      showNotification('error', 'Please specify a category.');
      return;
    }
    try {
      const { error } = await supabase.from('gallery_images').insert({
        image_url: galleryImageUrl,
        caption: galleryCaption,
        category: finalCategory.trim(),
      });

      if (error) throw error;

      showNotification('success', 'Gallery image added successfully!');
      setGalleryCaption('');
      setGalleryImageUrl('');
      setGalleryCustomCategory('');
      fetchData();
    } catch (err: any) {
      showNotification('error', `Failed to save gallery item: ${err.message}`);
    }
  };

  // Theme Settings Submit
  const handleAddTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('theme_settings').insert({
        name: themeName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        background_color: backgroundColor,
        foreground_color: foregroundColor,
        start_month: parseInt(startMonth),
        end_month: parseInt(endMonth),
      });
      if (error) throw error;
      showNotification('success', 'Theme added successfully!');
      // reset fields
      setThemeName('');
      setPrimaryColor('#7c3aed');
      setSecondaryColor('#a78bfa');
      setBackgroundColor('#faf5ff');
      setForegroundColor('#1e1b4b');
      setStartMonth('1');
      setEndMonth('12');
    } catch (err: any) {
      showNotification('error', `Failed to save theme: ${err.message}`);
    }
  };

  // Delete handlers
  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Item deleted successfully!');
      fetchData();
    } catch (err: any) {
      showNotification('error', `Failed to delete item: ${err.message}`);
    }
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Verifying access credentials...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center py-10 sm:py-20 px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="p-6 bg-gradient-to-br from-primary to-purple-800 text-white text-center space-y-2">
            <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center mx-auto border border-white/20 shadow-inner">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Admin Secretary Portal</h1>
            <p className="text-xs text-purple-100 font-medium">ACK Kabianga Parish</p>
          </div>

          {/* Form body */}
          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {authError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl flex items-start space-x-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-foreground/80 block">
                Secretary Email Address
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@ackkabiangaparish.or.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-foreground/80 block">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full touch-target mt-2 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Authenticate Access</span>
              )}
            </button>

            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
              Protected Administrator Area. Authorized personnel only. If you need credentials, 
              please contact the Diocese Database Administrator.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN WORKSPACE
  return (
    <div className="space-y-8 pb-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Secretary Portal
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as: <span className="font-bold text-foreground/80">{session.user.email}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="touch-target px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl border border-destructive/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5 self-start"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-start space-x-2 animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('carousel')}
          className={`touch-target px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'carousel'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Carousel Slides</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`touch-target px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'history'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>History Entries</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`touch-target px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'gallery'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GalleryIcon className="w-4 h-4" />
          <span>Photo Gallery</span>
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`touch-target px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTab === 'theme'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Theme Settings</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Inputs/Uploader Form */}
        <div className="lg:col-span-1 bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
          
          {/* TAB 1: Add Carousel Slide */}
          {activeTab === 'carousel' && (
            <form onSubmit={handleAddSlide} className="space-y-4">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
                New Carousel Slide
              </h2>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">1. Upload Image (Cloudinary)</label>
                {slideImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                    <img src={slideImageUrl} alt="Uploaded slide" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSlideImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/85"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <CloudinaryUploadWidget
                    onUploadSuccess={(url) => setSlideImageUrl(url)}
                    buttonText="Upload Slide Photo"
                    className="w-full text-xs py-3"
                    croppingAspectRatio={16/9}
                  />
                )}
                {slideImageUrl && (
                  <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Upload successful!</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="slideTitle" className="text-xs font-bold text-muted-foreground">
                  2. Slide Title
                </label>
                <input
                  id="slideTitle"
                  type="text"
                  required
                  placeholder="Welcome to Kabianga Parish"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="slideQuote" className="text-xs font-bold text-muted-foreground">
                  3. Inspirational Quote (Optional)
                </label>
                <textarea
                  id="slideQuote"
                  rows={3}
                  placeholder="Enter a Bible verse or inspiring message..."
                  value={slideQuote}
                  onChange={(e) => setSlideQuote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!slideImageUrl}
                className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Carousel Slide</span>
              </button>
            </form>
          )}

          {/* TAB 2: Add History Entry */}
          {activeTab === 'history' && (
            <form onSubmit={handleAddHistory} className="space-y-4">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
                New History Milestone
              </h2>

              <div className="space-y-1">
                <label htmlFor="historyYear" className="text-xs font-bold text-muted-foreground">
                  1. Year
                </label>
                <div className="relative">
                  <Calendar className="w-4.5 h-4.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="historyYear"
                    type="number"
                    required
                    placeholder="e.g. 1984"
                    value={historyYear}
                    onChange={(e) => setHistoryYear(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="historyTitle" className="text-xs font-bold text-muted-foreground">
                  2. Milestone Title
                </label>
                <input
                  id="historyTitle"
                  type="text"
                  required
                  placeholder="Building the sanctuary"
                  value={historyTitle}
                  onChange={(e) => setHistoryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="historyContent" className="text-xs font-bold text-muted-foreground">
                  3. Description Content
                </label>
                <textarea
                  id="historyContent"
                  rows={4}
                  required
                  placeholder="Provide historical context and information..."
                  value={historyContent}
                  onChange={(e) => setHistoryContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">
                  4. Image (Optional, Cloudinary)
                </label>
                {historyImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-border">
                    <img src={historyImageUrl} alt="Uploaded history image" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setHistoryImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/85"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <CloudinaryUploadWidget
                    onUploadSuccess={(url) => setHistoryImageUrl(url)}
                    buttonText="Upload History Photo"
                    className="w-full text-xs py-3 bg-secondary hover:bg-purple-400"
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save History Entry</span>
              </button>
            </form>
          )}

          {/* TAB 3: Add Gallery Image */}
          {activeTab === 'gallery' && (
            <form onSubmit={handleAddGallery} className="space-y-4">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
                New Gallery Image
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">1. Upload Image (Cloudinary)</label>
                {galleryImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-square border border-border">
                    <img src={galleryImageUrl} alt="Uploaded gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/85"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <CloudinaryUploadWidget
                    onUploadSuccess={(url) => setGalleryImageUrl(url)}
                    buttonText="Upload Gallery Photo"
                    className="w-full text-xs py-3"
                  />
                )}
                {galleryImageUrl && (
                  <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Upload successful!</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="galleryCategory" className="text-xs font-bold text-muted-foreground">
                  2. Photo Category
                </label>
                <select
                  id="galleryCategory"
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                >
                  <option value="General">General</option>
                  <option value="Sunday Service">Sunday Service</option>
                  <option value="Choir">Choir</option>
                  <option value="Youth">Youth</option>
                  <option value="Sunday School">Sunday School</option>
                  <option value="Community">Community</option>
                  <option value="Custom">-- Add Custom Category --</option>
                </select>
              </div>

              {galleryCategory === 'Custom' && (
                <div className="space-y-1">
                  <label htmlFor="galleryCustomCategory" className="text-xs font-bold text-accent">
                    Define Custom Category Name
                  </label>
                  <input
                    id="galleryCustomCategory"
                    type="text"
                    required
                    placeholder="e.g. Easter 2026"
                    value={galleryCustomCategory}
                    onChange={(e) => setGalleryCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-accent bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all touch-friendly-input"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="galleryCaption" className="text-xs font-bold text-muted-foreground">
                  3. Image Caption / Quote
                </label>
                <textarea
                  id="galleryCaption"
                  rows={3}
                  placeholder="Describe this photo for our community..."
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!galleryImageUrl}
                className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Photo Gallery</span>
              </button>
            </form>
          )}

          {activeTab === 'theme' && (
              <form onSubmit={handleAddTheme} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
                  Theme Settings
                </h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Theme Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Easter"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Primary Color</label>
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-10 rounded-xl border border-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Secondary Color</label>
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full h-10 rounded-xl border border-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Background Color</label>
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-10 rounded-xl border border-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Foreground Color</label>
                    <input type="color" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} className="w-full h-10 rounded-xl border border-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Start Month (1-12)</label>
                    <input type="number" min="1" max="12" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">End Month (1-12)</label>
                    <input type="number" min="1" max="12" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center"
                >
                  Save Theme
                </button>
              </form>
            )}

        </div>

        {/* Right Columns: Data List View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h2 className="text-base font-extrabold text-foreground">
              Existing Entries ({activeTab === 'carousel' ? slides.length : activeTab === 'history' ? historyEntries.length : galleryImages.length})
            </h2>
            {dataLoading && <Loader2 className="w-4.5 h-4.5 text-primary animate-spin" />}
          </div>

          {/* Loader or Empty display */}
          {!dataLoading && (activeTab === 'carousel' ? slides.length : activeTab === 'history' ? historyEntries.length : galleryImages.length) === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">No entries found. Add your first entry using the form on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Slides List */}
              {activeTab === 'carousel' && slides.map((slide) => (
                <div key={slide.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative aspect-video">
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-foreground truncate">{slide.title}</h4>
                      {slide.quote && (
                        <p className="text-xs text-muted-foreground italic line-clamp-2 mt-1">
                          {slide.quote}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete('carousel_slides', slide.id)}
                      className="touch-target py-2 px-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/15 transition-all flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Slide</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* History Entries List */}
              {activeTab === 'history' && historyEntries.map((entry) => (
                <div key={entry.id} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {entry.year}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{entry.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">{entry.content}</p>
                    {entry.image_url && (
                      <div className="relative rounded overflow-hidden aspect-video border border-border/50">
                        <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete('history_entries', entry.id)}
                    className="touch-target py-2 px-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/15 transition-all flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Milestone</span>
                  </button>
                </div>
              ))}

              {/* Gallery Images List */}
              {activeTab === 'gallery' && galleryImages.map((img) => (
                <div key={img.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative aspect-square">
                    <img src={img.image_url} alt="Gallery item" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-accent px-2 py-0.5 rounded">
                      {img.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-foreground/80 line-clamp-2 min-h-[2rem]">
                      {img.caption || 'No caption'}
                    </p>
                    <button
                      onClick={() => handleDelete('gallery_images', img.id)}
                      className="touch-target py-2 px-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/15 transition-all flex items-center justify-center space-x-1 w-full"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Photo</span>
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
