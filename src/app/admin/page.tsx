'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  Calendar,
  Users,
  Heart,
  Coins,
  FileText,
  Clock,
  Compass,
  FileDown,
  Volume2,
  Check,
  X,
  Landmark,
  ShieldCheck
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

  // Tab control
  const [activeTab, setActiveTab] = useState<
    'carousel' | 'history' | 'gallery' | 'theme' | 'schedules' | 
    'readings' | 'jumuiyas' | 'societies' | 'prayers' | 
    'giving' | 'registrations' | 'bulletins' | 'sermons' | 'bookings' | 'centers' | 'admins'
  >('carousel');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Loaded DB data states
  const [slides, setSlides] = useState<any[]>([]);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [jumuiyas, setJumuiyas] = useState<any[]>([]);
  const [societies, setSocieties] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [givingProjects, setGivingProjects] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [sermons, setSermons] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [administrators, setAdministrators] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Administrators invite form inputs
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [inviteLoading, setInviteLoading] = useState(false);

  // Form Inputs State
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
  const [primaryColor, setPrimaryColor] = useState('#16a34a');
  const [secondaryColor, setSecondaryColor] = useState('#15803d');
  const [backgroundColor, setBackgroundColor] = useState('#fafdfb');
  const [foregroundColor, setForegroundColor] = useState('#14532d');
  const [startMonth, setStartMonth] = useState('1');
  const [endMonth, setEndMonth] = useState('12');

  // Schedule Form
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDay, setSchedDay] = useState('0'); // Sunday
  const [schedStart, setSchedStart] = useState('');
  const [schedEnd, setSchedEnd] = useState('');
  const [schedDetails, setSchedDetails] = useState('');
  const [schedType, setSchedType] = useState('Mass');

  // Readings Form
  const [readDate, setReadDate] = useState('');
  const [readEngVerse, setReadEngVerse] = useState('');
  const [readEngText, setReadEngText] = useState('');
  const [readSwaVerse, setReadSwaVerse] = useState('');
  const [readSwaText, setReadSwaText] = useState('');
  const [ocrImageUrl, setOcrImageUrl] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [preloadLoading, setPreloadLoading] = useState(false);

  // Jumuiya Form
  const [jName, setJName] = useState('');
  const [jZone, setJZone] = useState('');
  const [jLeader, setJLeader] = useState('');
  const [jPhone, setJPhone] = useState('');
  const [jDay, setJDay] = useState('');
  const [jLocation, setJLocation] = useState('');
  const [jCenterName, setJCenterName] = useState('');

  // Societies Form
  const [socSelectCode, setSocSelectCode] = useState('');
  const [socDesc, setSocDesc] = useState('');
  const [socLeader, setSocLeader] = useState('');
  const [socPattern, setSocPattern] = useState('');
  const [socAnnounce, setSocAnnounce] = useState('');

  // Giving Project Form
  const [gpTitle, setGpTitle] = useState('');
  const [gpDesc, setGpDesc] = useState('');
  const [gpTarget, setGpTarget] = useState('');
  const [gpCurrent, setGpCurrent] = useState('0');
  const [gpPaybillAcc, setGpPaybillAcc] = useState('');

  // Bulletin Form
  const [bullTitle, setBullTitle] = useState('');
  const [bullUrl, setBullUrl] = useState('');
  const [bullDate, setBullDate] = useState('');

  // Sermon Form
  const [sermTitle, setSermTitle] = useState('');
  const [sermPreacher, setSermPreacher] = useState('');
  const [sermVerse, setSermVerse] = useState('');
  const [sermSummary, setSermSummary] = useState('');
  const [sermAudioUrl, setSermAudioUrl] = useState('');
  const [sermDate, setSermDate] = useState('');

  // Center Form
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [catName, setCatName] = useState('');
  const [catPhone, setCatPhone] = useState('');
  const [chairName, setChairName] = useState('');
  const [chairPhone, setChairPhone] = useState('');
  const [secName, setSecName] = useState('');
  const [secPhone, setSecPhone] = useState('');
  const [treasName, setTreasName] = useState('');
  const [treasPhone, setTreasPhone] = useState('');
  const [centerImageUrl, setCenterImageUrl] = useState('');
  const [centerImages, setCenterImages] = useState<string[]>([]);
  const [editingCenter, setEditingCenter] = useState<any>(null);

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

  // Fetch data depending on activeTab
  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session, activeTab]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  async function fetchData() {
    setDataLoading(true);
    try {
      if (activeTab === 'carousel') {
        const { data, error } = await supabase.from('carousel_slides').select('*').order('display_order', { ascending: true });
        if (error) throw error;
        setSlides(data || []);
      } else if (activeTab === 'history') {
        const { data, error } = await supabase.from('history_entries').select('*').order('year', { ascending: true });
        if (error) throw error;
        setHistoryEntries(data || []);
      } else if (activeTab === 'gallery') {
        const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setGalleryImages(data || []);
      } else if (activeTab === 'theme') {
        const { data, error } = await supabase.from('theme_settings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setThemes(data || []);
      } else if (activeTab === 'schedules') {
        const { data, error } = await supabase.from('service_schedules').select('*').order('day_of_week', { ascending: true });
        if (error) throw error;
        setSchedules(data || []);
      } else if (activeTab === 'readings') {
        const { data, error } = await supabase.from('daily_readings').select('*').order('reading_date', { ascending: false }).limit(20);
        if (error) throw error;
        setReadings(data || []);
      } else if (activeTab === 'admins') {
        const { data, error } = await supabase.from('administrators').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setAdministrators(data || []);
      } else if (activeTab === 'jumuiyas') {
        const { data, error } = await supabase.from('jumuiyas').select('*').order('name', { ascending: true });
        // Fetch centers for linking dropdown
        const { data: centersData } = await supabase.from('centers').select('name');
        setCenters(centersData || []);
        if (error) throw error;
        setJumuiyas(data || []);
      } else if (activeTab === 'societies') {
        const { data, error } = await supabase.from('societies').select('*').order('name', { ascending: true });
        if (error) throw error;
        setSocieties(data || []);
        if (data && data.length > 0 && !socSelectCode) {
          loadSocietyForEdit(data[0]);
        }
      } else if (activeTab === 'prayers') {
        const { data, error } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setPrayers(data || []);
      } else if (activeTab === 'giving') {
        const { data, error } = await supabase.from('giving_projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setGivingProjects(data || []);
      } else if (activeTab === 'registrations') {
        const { data, error } = await supabase.from('sacramental_registrations').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setRegistrations(data || []);
      } else if (activeTab === 'bulletins') {
        const { data, error } = await supabase.from('bulletin_archives').select('*').order('publish_date', { ascending: false });
        if (error) throw error;
        setBulletins(data || []);
      } else if (activeTab === 'sermons') {
        const { data, error } = await supabase.from('sermons').select('*').order('date', { ascending: false });
        if (error) throw error;
        setSermons(data || []);
      } else if (activeTab === 'bookings') {
        const { data, error } = await supabase.from('equipment_bookings').select('*').order('start_date', { ascending: false });
        if (error) throw error;
        setBookings(data || []);
      } else if (activeTab === 'centers') {
        const { data, error } = await supabase.from('centers').select('*').order('name', { ascending: true });
        if (error) throw error;
        setCenters(data || []);
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

  // Submit methods
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImageUrl) return showNotification('error', 'Please upload an image first.');
    try {
      const displayOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order || 0)) + 1 : 0;
      const { error } = await supabase.from('carousel_slides').insert({
        title: slideTitle, quote: slideQuote, image_url: slideImageUrl, display_order: displayOrder
      });
      if (error) throw error;
      showNotification('success', 'Slide added successfully!');
      setSlideTitle(''); setSlideQuote(''); setSlideImageUrl('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    const yearNum = parseInt(historyYear);
    if (isNaN(yearNum)) return showNotification('error', 'Enter a numeric year.');
    try {
      const { error } = await supabase.from('history_entries').insert({
        year: yearNum, title: historyTitle, content: historyContent, image_url: historyImageUrl || null
      });
      if (error) throw error;
      showNotification('success', 'History entry added!');
      setHistoryYear(''); setHistoryTitle(''); setHistoryContent(''); setHistoryImageUrl('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImageUrl) return showNotification('error', 'Please upload photo.');
    const cat = galleryCategory === 'Custom' ? galleryCustomCategory : galleryCategory;
    try {
      const { error } = await supabase.from('gallery_images').insert({
        image_url: galleryImageUrl, caption: galleryCaption, category: cat
      });
      if (error) throw error;
      showNotification('success', 'Photo added!');
      setGalleryCaption(''); setGalleryImageUrl(''); setGalleryCustomCategory('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('theme_settings').insert({
        name: themeName, primary_color: primaryColor, secondary_color: secondaryColor,
        background_color: backgroundColor, foreground_color: foregroundColor,
        start_month: parseInt(startMonth), end_month: parseInt(endMonth)
      });
      if (error) throw error;
      showNotification('success', 'Theme added successfully!');
      setThemeName('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('service_schedules').insert({
        title: schedTitle, day_of_week: parseInt(schedDay), start_time: `${schedStart}:00`,
        end_time: `${schedEnd}:00`, details: schedDetails, type: schedType
      });
      if (error) throw error;
      showNotification('success', 'Schedule added!');
      setSchedTitle(''); setSchedStart(''); setSchedEnd(''); setSchedDetails('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('daily_readings').insert({
        reading_date: readDate, english_reading: readEngText, swahili_reading: readSwaText,
        english_verse: readEngVerse, swahili_verse: readSwaVerse
      });
      if (error) throw error;
      showNotification('success', 'Daily Readings added!');
      setReadDate(''); setReadEngVerse(''); setReadEngText(''); setReadSwaVerse(''); setReadSwaText(''); setOcrImageUrl('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      return showNotification('error', 'All fields are required.');
    }
    setInviteLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;
      
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          name: newAdminName,
          role: newAdminRole
        })
      });
      
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || 'Invitation failed');
      }
      
      showNotification('success', resJson.message || 'Administrator added successfully!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminRole('admin');
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to add administrator');
    } finally {
      setInviteLoading(false);
    }
  };

  const runOcrExtractor = async () => {
    if (!ocrImageUrl) return showNotification('error', 'Upload a screenshot image first.');
    setOcrLoading(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: ocrImageUrl }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'OCR failed');
      
      setReadSwaText(prev => prev ? `${prev}\n\n${resData.text}` : resData.text);
      showNotification('success', 'Extracted text appended successfully!');
    } catch (err: any) {
      showNotification('error', `OCR Error: ${err.message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handlePreloadReadings = async () => {
    setPreloadLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;
      
      const res = await fetch('/api/readings/preload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || 'Preload failed');
      }
      
      showNotification('success', 'Mass readings for the next 7 days have been successfully preloaded & cached!');
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to preload readings');
    } finally {
      setPreloadLoading(false);
    }
  };

  const handleAddJumuiya = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('jumuiyas').insert({
        name: jName, zone: jZone, leader_name: jLeader, leader_phone: jPhone,
        meeting_day: jDay, meeting_location: jLocation, center_name: jCenterName || null
      });
      if (error) throw error;
      showNotification('success', 'Jumuiya added!');
      setJName(''); setJZone(''); setJLeader(''); setJPhone(''); setJDay(''); setJLocation(''); setJCenterName('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const loadSocietyForEdit = (soc: any) => {
    setSocSelectCode(soc.code);
    setSocDesc(soc.description || '');
    setSocLeader(soc.leadership || '');
    setSocPattern(soc.meeting_pattern || '');
    setSocAnnounce(soc.announcements || '');
  };

  const handleUpdateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('societies')
        .update({
          description: socDesc,
          leadership: socLeader,
          meeting_pattern: socPattern,
          announcements: socAnnounce
        })
        .eq('code', socSelectCode);
      
      if (error) throw error;
      showNotification('success', 'Society updated successfully!');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddGiving = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('giving_projects').insert({
        title: gpTitle, description: gpDesc, target_amount: parseFloat(gpTarget),
        current_amount: parseFloat(gpCurrent) || 0, paybill_account: gpPaybillAcc
      });
      if (error) throw error;
      showNotification('success', 'Project added!');
      setGpTitle(''); setGpDesc(''); setGpTarget(''); setGpCurrent('0'); setGpPaybillAcc('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bullUrl) return showNotification('error', 'Upload PDF document.');
    try {
      const { error } = await supabase.from('bulletin_archives').insert({
        title: bullTitle, file_url: bullUrl, publish_date: bullDate || new Date().toISOString().split('T')[0]
      });
      if (error) throw error;
      showNotification('success', 'Bulletin saved!');
      setBullTitle(''); setBullUrl(''); setBullDate('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('sermons').insert({
        title: sermTitle, preacher: sermPreacher, scripture_reference: sermVerse,
        summary: sermSummary, audio_url: sermAudioUrl || null,
        date: sermDate || new Date().toISOString().split('T')[0]
      });
      if (error) throw error;
      showNotification('success', 'Sermon added!');
      setSermTitle(''); setSermPreacher(''); setSermVerse(''); setSermSummary(''); setSermAudioUrl(''); setSermDate('');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadersList = [
      { role: 'Catechist', name: catName, phone: catPhone },
      { role: 'Chairman', name: chairName, phone: chairPhone },
      { role: 'Secretary', name: secName, phone: secPhone },
      { role: 'Treasurer', name: treasName, phone: treasPhone }
    ].filter(l => l.name.trim()); // Only keep filled roles

    try {
      if (editingCenter) {
        const { error } = await supabase
          .from('centers')
          .update({
            name: cName,
            description: cDesc,
            leaders: leadersList,
            images: centerImages
          })
          .eq('id', editingCenter.id);
          
        if (error) throw error;
        showNotification('success', 'Outstation Center updated successfully!');
      } else {
        const { error } = await supabase.from('centers').insert({
          name: cName,
          description: cDesc,
          leaders: leadersList,
          images: centerImages
        });
        if (error) throw error;
        showNotification('success', 'Outstation Center added!');
      }
      
      setCName(''); setCDesc(''); setCatName(''); setCatPhone(''); setChairName(''); setChairPhone(''); setSecName(''); setSecPhone(''); setTreasName(''); setTreasPhone(''); setCenterImages([]);
      setEditingCenter(null);
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const loadCenterForEdit = (center: any) => {
    setEditingCenter(center);
    setCName(center.name);
    setCDesc(center.description || '');
    
    setCatName(''); setCatPhone('');
    setChairName(''); setChairPhone('');
    setSecName(''); setSecPhone('');
    setTreasName(''); setTreasPhone('');
    
    if (center.leaders && Array.isArray(center.leaders)) {
      center.leaders.forEach((l: any) => {
        if (l.role === 'Catechist') {
          setCatName(l.name || '');
          setCatPhone(l.phone || '');
        } else if (l.role === 'Chairman') {
          setChairName(l.name || '');
          setChairPhone(l.phone || '');
        } else if (l.role === 'Secretary') {
          setSecName(l.name || '');
          setSecPhone(l.phone || '');
        } else if (l.role === 'Treasurer') {
          setTreasName(l.name || '');
          setTreasPhone(l.phone || '');
        }
      });
    }
    
    setCenterImages(center.images || []);
    setCenterImageUrl('');
  };

  const handleCancelCenterEdit = () => {
    setCName(''); setCDesc(''); setCatName(''); setCatPhone(''); setChairName(''); setChairPhone(''); setSecName(''); setSecPhone(''); setTreasName(''); setTreasPhone(''); setCenterImages([]);
    setEditingCenter(null);
  };

  const handleAddCenterImage = () => {
    if (!centerImageUrl) return;
    setCenterImages(prev => [...prev, centerImageUrl]);
    setCenterImageUrl('');
  };

  // Status updates
  const handleUpdateBooking = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('equipment_bookings').update({ status }).eq('id', id);
      if (error) throw error;
      showNotification('success', `Booking request ${status}!`);
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleModeratePrayer = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        const { error } = await supabase.from('prayer_requests').update({ is_moderated: true }).eq('id', id);
        if (error) throw error;
        showNotification('success', 'Prayer approved!');
      } else {
        const { error } = await supabase.from('prayer_requests').delete().eq('id', id);
        if (error) throw error;
        showNotification('success', 'Prayer deleted!');
      }
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleUpdateRegStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('sacramental_registrations').update({ status }).eq('id', id);
      if (error) throw error;
      showNotification('success', 'Registration status updated!');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Item deleted!');
      fetchData();
    } catch (err: any) { showNotification('error', err.message); }
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Authenticating session...</p>
      </div>
    );
  }

  // LOGIN PORTAL
  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center py-10 sm:py-20 px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden font-sans">
          <div className="p-6 bg-gradient-to-br from-primary to-purple-800 text-white text-center space-y-2">
            <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center mx-auto border border-white/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Admin Secretary Portal</h1>
            <p className="text-xs text-purple-100 font-medium">Kabianga Parish Administration</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {authError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-foreground/80 block">Secretary Email Address</label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@parishkabianga.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-foreground/80 block">Access Password</label>
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
              className="w-full touch-target mt-2 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Authenticate Access</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // WORKSPACE
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            Parish Secretary Workspace
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Connected
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in: <span className="font-bold text-foreground/80">{session.user.email}</span>
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

      {notification && (
        <div className={`p-4 rounded-xl border flex items-start space-x-2 animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Tabs scroll header */}
      <div className="flex flex-col space-y-4">
        <div className="flex border-b border-border overflow-x-auto no-scrollbar pb-1 gap-1">
          {[
            { id: 'carousel', label: 'Hero Slides', icon: Sliders },
            { id: 'centers', label: 'Centers (Outstations)', icon: Landmark },
            { id: 'jumuiyas', label: 'Jumuiyas (SCCs)', icon: Users },
            { id: 'societies', label: 'Societies Groups', icon: Compass },
            { id: 'schedules', label: 'Service Schedules', icon: Clock },
            { id: 'readings', label: 'Bible Readings', icon: BookOpen },
            { id: 'giving', label: 'Giving Projects', icon: Coins },
            { id: 'registrations', label: 'Sacraments Registry', icon: FileText },
            { id: 'prayers', label: 'Moderation Wall', icon: Heart },
            { id: 'bulletins', label: 'Weekly Bulletins', icon: FileDown },
            { id: 'sermons', label: 'Homily reflections', icon: Volume2 },
            { id: 'bookings', label: 'Asset Bookings', icon: Calendar },
            { id: 'history', label: 'Parish History', icon: BookOpen },
            { id: 'gallery', label: 'Photo Gallery', icon: GalleryIcon },
            { id: 'theme', label: 'Theme settings', icon: Sliders },
            { id: 'admins', label: 'Admin Accounts', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`touch-target px-4 py-2 border-b-2 font-bold text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form column (Left) */}
          <div className="lg:col-span-1 bg-card border border-border p-6 rounded-2xl shadow-sm h-fit space-y-4">
            
            {/* CAROUSEL FORM */}
            {activeTab === 'carousel' && (
              <form onSubmit={handleAddSlide} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">New Hero Slide</h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Upload Image</label>
                  {slideImageUrl ? (
                    <div className="relative rounded overflow-hidden aspect-video border"><img src={slideImageUrl} className="object-cover w-full h-full" /><button onClick={() => setSlideImageUrl('')} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  ) : (
                    <CloudinaryUploadWidget onUploadSuccess={setSlideImageUrl} buttonText="Select Slide Photo" croppingAspectRatio={16/9} />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Slide Title</label>
                  <input type="text" required placeholder="Welcome message..." value={slideTitle} onChange={e => setSlideTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Verse / Quote</label>
                  <textarea rows={3} placeholder="Isaiah 40..." value={slideQuote} onChange={e => setSlideQuote(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" />
                </div>
                <button type="submit" disabled={!slideImageUrl} className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-50">Save Slide</button>
              </form>
            )}

            {/* OUTSTATION CENTER FORM */}
            {activeTab === 'centers' && (
              <form onSubmit={handleAddCenter} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">
                  {editingCenter ? 'Edit Outstation Center' : 'New Outstation Center'}
                </h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Center Name</label>
                  <input type="text" required placeholder="St. Augustine Kiptere" value={cName} onChange={e => setCName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Description</label>
                  <textarea rows={2} required placeholder="Center details & summary..." value={cDesc} onChange={e => setCDesc(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" />
                </div>
                
                {/* Leaders inputs */}
                <div className="bg-muted/40 p-3 rounded-xl border border-border/50 space-y-3">
                  <label className="text-[10px] font-black uppercase text-primary tracking-wide block">Leaders details (Up to 4)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div><input type="text" placeholder="Catechist Name" value={catName} onChange={e => setCatName(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="tel" placeholder="Catechist Phone" value={catPhone} onChange={e => setCatPhone(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="text" placeholder="Chairman Name" value={chairName} onChange={e => setChairName(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="tel" placeholder="Chairman Phone" value={chairPhone} onChange={e => setChairPhone(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="text" placeholder="Secretary Name" value={secName} onChange={e => setSecName(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="tel" placeholder="Secretary Phone" value={secPhone} onChange={e => setSecPhone(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="text" placeholder="Treasurer Name" value={treasName} onChange={e => setTreasName(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                    <div><input type="tel" placeholder="Treasurer Phone" value={treasPhone} onChange={e => setTreasPhone(e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></div>
                  </div>
                </div>

                {/* Center Image Upload */}
                <div className="bg-muted/40 p-3 rounded-xl border border-border/50 space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-wide block">Center Photos ({centerImages.length} uploaded)</label>
                  {centerImageUrl ? (
                    <button type="button" onClick={handleAddCenterImage} className="w-full py-1.5 bg-accent text-white text-xs font-bold rounded-lg">Confirm Uploaded Photo</button>
                  ) : (
                    <CloudinaryUploadWidget onUploadSuccess={setCenterImageUrl} buttonText="Upload Center Photo" />
                  )}
                  {centerImages.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {centerImages.map((img, idx) => <span key={idx} className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full truncate max-w-[80px]">Photo {idx+1}</span>)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingCenter && (
                    <button type="button" onClick={handleCancelCenterEdit} className="flex-1 py-2 bg-muted hover:bg-border text-foreground text-xs font-bold rounded-xl">
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl">
                    {editingCenter ? 'Save Changes' : 'Save Outstation Center'}
                  </button>
                </div>
              </form>
            )}

            {/* JUMUIYA FORM */}
            {activeTab === 'jumuiyas' && (
              <form onSubmit={handleAddJumuiya} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">New Jumuiya</h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Select Center (Outstation)</label>
                  <select value={jCenterName} onChange={e => setJCenterName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl bg-background text-sm font-bold">
                    <option value="">-- Select Center --</option>
                    {centers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Jumuiya Name</label><input type="text" required placeholder="Mtakatifu Yuda Tadeo" value={jName} onChange={e => setJName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Zone</label><input type="text" required placeholder="Kabianga Central" value={jZone} onChange={e => setJZone(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Leader Name</label><input type="text" required placeholder="Peter Mutai" value={jLeader} onChange={e => setJLeader(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Leader Phone</label><input type="text" required placeholder="0704285127" value={jPhone} onChange={e => setJPhone(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Meeting Day & Time</label><input type="text" required placeholder="Thursdays at 5:00 PM" value={jDay} onChange={e => setJDay(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Meeting Venue</label><input type="text" placeholder="Rotational" value={jLocation} onChange={e => setJLocation(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <button type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl">Save Jumuiya</button>
              </form>
            )}

            {/* SOCIETIES HUB EDIT FORM */}
            {activeTab === 'societies' && (
              <form onSubmit={handleUpdateSociety} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">Update Society Settings</h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Select Society</label>
                  <select value={socSelectCode} onChange={e => {
                    const soc = societies.find(s => s.code === e.target.value);
                    if (soc) loadSocietyForEdit(soc);
                  }} className="w-full px-3 py-2 border rounded-xl bg-background text-sm font-bold">
                    {societies.map(s => <option key={s.id} value={s.code}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Description</label><textarea rows={3} required value={socDesc} onChange={e => setSocDesc(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Leadership Details</label><textarea rows={2} required placeholder="Chairperson..." value={socLeader} onChange={e => setSocLeader(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Meeting Pattern</label><input type="text" required value={socPattern} onChange={e => setSocPattern(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Society Announcement</label><textarea rows={3} placeholder="Latest updates..." value={socAnnounce} onChange={e => setSocAnnounce(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <button type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl font-sans">Save Changes</button>
              </form>
            )}

            {/* SCHEDULE FORM */}
            {activeTab === 'schedules' && (
              <form onSubmit={handleAddSchedule} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">New Timetable Schedule</h2>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Service Name</label><input type="text" required placeholder="First Sunday Mass" value={schedTitle} onChange={e => setSchedTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Day of Week</label>
                  <select value={schedDay} onChange={e => setSchedDay(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm">
                    <option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-bold">Start Time</label><input type="time" required value={schedStart} onChange={e => setSchedStart(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" /></div>
                  <div><label className="text-[10px] font-bold">End Time</label><input type="time" required value={schedEnd} onChange={e => setSchedEnd(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" /></div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Service Type</label>
                  <select value={schedType} onChange={e => setSchedType(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm">
                    <option value="Mass">Holy Mass</option><option value="Confession">Confession</option>
                  </select>
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Details / Description</label><input type="text" placeholder="Holy Communion" value={schedDetails} onChange={e => setSchedDetails(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <button type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl">Save Schedule</button>
              </form>
            )}

            {/* BIBLE READINGS */}
            {activeTab === 'readings' && (
              <div className="space-y-6">
                <form onSubmit={handleAddReading} className="space-y-4">
                  <h2 className="text-base font-bold text-foreground border-b pb-2">Daily Scriptures</h2>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Date</label><input type="date" required value={readDate} onChange={e => setReadDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                  <div className="bg-muted/40 p-3 rounded-xl border border-border space-y-2">
                    <label className="text-[10px] font-bold text-accent uppercase tracking-wider block">Scripture OCR Text Extractor</label>
                    {ocrImageUrl ? (
                      <div className="space-y-2">
                        <div className="relative aspect-video rounded border overflow-hidden bg-black/10"><img src={ocrImageUrl} className="object-cover w-full h-full" /></div>
                        <button type="button" onClick={runOcrExtractor} disabled={ocrLoading} className="w-full py-2 bg-accent text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1">
                          {ocrLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : null}
                          <span>Extract & Auto-Fill Swahili</span>
                        </button>
                      </div>
                    ) : (
                      <CloudinaryUploadWidget onUploadSuccess={setOcrImageUrl} buttonText="Upload Reading screenshot" className="w-full bg-accent hover:bg-emerald-600 text-xs py-2" />
                    )}
                  </div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">English Verse Title</label><input type="text" required placeholder="John 3:16" value={readEngVerse} onChange={e => setReadEngVerse(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">English Reading Content</label><textarea rows={3} required placeholder="Full scripture text..." value={readEngText} onChange={e => setReadEngText(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Swahili Verse Title</label><input type="text" required placeholder="Yohana 3:16" value={readSwaVerse} onChange={e => setReadSwaVerse(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Swahili Reading Content</label><textarea rows={3} required placeholder="Maandiko ya Kiswahili..." value={readSwaText} onChange={e => setReadSwaText(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                  <button type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl">Save Readings</button>
                </form>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                  <h3 className="text-xs font-extrabold text-primary uppercase tracking-wide">Automated Preloading</h3>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Pull and cache mass scriptures (both English & Kiswahili) for the next 7 days in advance. This prevents on-demand scraping when parishioners access the site.
                  </p>
                  <button
                    type="button"
                    onClick={handlePreloadReadings}
                    disabled={preloadLoading}
                    className="w-full touch-target py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-[0.98]"
                  >
                    {preloadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Preload & Cache Next 7 Days</span>
                  </button>
                </div>
              </div>
            )}

            {/* GIVING PROJECT FORM */}
            {activeTab === 'giving' && (
              <form onSubmit={handleAddGiving} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">New Development Project</h2>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Project Title</label><input type="text" required placeholder="Sanctuary Floor Tiling" value={gpTitle} onChange={e => setGpTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Description</label><textarea rows={3} required placeholder="Project details" value={gpDesc} onChange={e => setGpDesc(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-bold">Target Contribution</label><input type="number" required placeholder="1200000" value={gpTarget} onChange={e => setGpTarget(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" /></div>
                  <div><label className="text-[10px] font-bold">Current Amount Raised</label><input type="number" value={gpCurrent} onChange={e => setGpCurrent(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-xs" /></div>
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Custom Paybill Account Name</label><input type="text" placeholder="e.g. TILING" value={gpPaybillAcc} onChange={e => setGpPaybillAcc(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <button type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl">Save Project</button>
              </form>
            )}

            {/* BULLETINS UPLOADER */}
            {activeTab === 'bulletins' && (
              <form onSubmit={handleAddBulletin} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">Upload Parish Bulletin</h2>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Upload Document (PDF)</label>
                  {bullUrl ? (
                    <p className="text-emerald-500 text-xs font-bold">PDF Upload successful!</p>
                  ) : (
                    <CloudinaryUploadWidget onUploadSuccess={setBullUrl} buttonText="Select PDF Bulletin File" />
                  )}
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Bulletin Title</label><input type="text" required placeholder="Bulletin - June 22nd" value={bullTitle} onChange={e => setBullTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Publish Date</label><input type="date" value={bullDate} onChange={e => setBullDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <button type="submit" disabled={!bullUrl} className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl disabled:opacity-50 font-sans">Publish Bulletin</button>
              </form>
            )}

            {/* SERMON ARCHIVE FORM */}
            {activeTab === 'sermons' && (
              <form onSubmit={handleAddSermon} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">Archive Reflection Homily</h2>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Homily Title</label><input type="text" required placeholder="The Prodigal Son" value={sermTitle} onChange={e => setSermTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Preacher</label><input type="text" required placeholder="Fr. Joseph" value={sermPreacher} onChange={e => setSermPreacher(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Scripture Reference</label><input type="text" placeholder="Luke 15:11-32" value={sermVerse} onChange={e => setSermVerse(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Reflection Summary</label><textarea rows={3} required value={sermSummary} onChange={e => setSermSummary(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Audio Recording (Optional Mp3)</label>
                  {sermAudioUrl ? (
                    <p className="text-emerald-500 text-xs font-bold">Audio upload successful!</p>
                  ) : (
                    <CloudinaryUploadWidget onUploadSuccess={setSermAudioUrl} buttonText="Upload Mp3 File" />
                  )}
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Date</label><input type="date" value={sermDate} onChange={e => setSermDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <button type="submit" className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl">Save Homily</button>
              </form>
            )}

            {/* ADMINISTRATOR REGISTRATION FORM */}
            {activeTab === 'admins' && (
              <form onSubmit={handleInviteAdmin} className="space-y-4">
                <h2 className="text-base font-bold text-foreground border-b pb-2">Invite New Administrator</h2>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Admin Full Name</label><input type="text" required placeholder="John Doe" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Admin Email Address</label><input type="email" required placeholder="admin2@kabiangaparish.org" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground">Access Password</label><input type="password" required placeholder="••••••••" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm" /></div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Role</label>
                  <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-background text-sm">
                    <option value="admin">Administrator</option>
                    <option value="moderator">Moderator</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <button type="submit" disabled={inviteLoading} className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5">
                  {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Register Administrator</span>
                </button>
              </form>
            )}

            {/* GENERAL TEXT FOR DIRECT READ TABS */}
            {['bookings', 'registrations', 'prayers', 'history', 'gallery'].includes(activeTab) && (
              <div className="bg-muted/40 p-4 rounded-xl space-y-2 border">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wide">Listing Administrator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Select, delete, or update the states of registrations and content records using the panels on the right side.
                </p>
              </div>
            )}

          </div>

          {/* Data List (Right Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-base font-extrabold text-foreground">Existing Listings</h2>
              {dataLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            </div>

            {/* CAROUSEL LIST */}
            {activeTab === 'carousel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slides.map(slide => (
                  <div key={slide.id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <img src={slide.image_url} className="aspect-video object-cover" />
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div><h4 className="font-extrabold text-sm">{slide.title}</h4><p className="text-xs text-muted-foreground italic truncate">{slide.quote}</p></div>
                      <button onClick={() => handleDelete('carousel_slides', slide.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Remove Slide</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CENTERS LIST */}
            {activeTab === 'centers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {centers.map(c => (
                  <div key={c.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-primary">{c.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                      {c.leaders && c.leaders.length > 0 && (
                        <div className="text-[10px] text-muted-foreground mt-2 border-t pt-2 space-y-0.5">
                          {c.leaders.map((l: any, idx: number) => <p key={idx}><strong>{l.role}:</strong> {l.name} ({l.phone})</p>)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadCenterForEdit(c)} className="flex-1 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-lg transition-all">Edit Details</button>
                      <button onClick={() => handleDelete('centers', c.id)} className="flex-1 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold rounded-lg transition-all">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* JUMUIYA LIST */}
            {activeTab === 'jumuiyas' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jumuiyas.map(j => (
                  <div key={j.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm">{j.name} ({j.zone})</h4>
                      <p className="text-xs text-muted-foreground mt-1">Leader: {j.leader_name} ({j.leader_phone})</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Meets: {j.meeting_day} @ {j.meeting_location || 'N/A'}</p>
                      {j.center_name && <p className="text-[9px] text-accent bg-accent/5 px-2 py-0.5 w-fit rounded font-bold mt-1">Center: {j.center_name}</p>}
                    </div>
                    <button onClick={() => handleDelete('jumuiyas', j.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Delete Jumuiya</button>
                  </div>
                ))}
              </div>
            )}

            {/* SOCIETIES HUB DIRECTORY VIEW */}
            {activeTab === 'societies' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {societies.map(s => (
                  <button key={s.id} onClick={() => loadSocietyForEdit(s)} className={`text-left bg-card border p-4 rounded-xl shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-2 ${socSelectCode === s.code ? 'border-primary shadow-md bg-primary/5' : ''}`}>
                    <div>
                      <h4 className="font-extrabold text-sm">{s.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description}</p>
                    </div>
                    <span className="text-[10px] text-primary font-bold">Tap to edit details →</span>
                  </button>
                ))}
              </div>
            )}

            {/* SCHEDULES LIST */}
            {activeTab === 'schedules' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {schedules.map(s => (
                  <div key={s.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                        {s.type}
                      </span>
                      <h4 className="font-extrabold text-sm mt-1">{s.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Time: {s.start_time} - {s.end_time} • Day: {s.day_of_week === 0 ? 'Sunday' : s.day_of_week === 6 ? 'Saturday' : 'Weekday'}
                      </p>
                      {s.details && <p className="text-[10px] text-muted-foreground italic mt-0.5">{s.details}</p>}
                    </div>
                    <button onClick={() => handleDelete('service_schedules', s.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Delete Schedule</button>
                  </div>
                ))}
              </div>
            )}

            {/* READINGS LIST */}
            {activeTab === 'readings' && (
              <div className="space-y-3">
                {readings.map(r => (
                  <div key={r.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">{r.reading_date}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Eng: {r.english_verse} • Swa: {r.swahili_verse}</p>
                    </div>
                    <button onClick={() => handleDelete('daily_readings', r.id)} className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-bold rounded-lg shrink-0">Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* GIVING PROJECTS LIST */}
            {activeTab === 'giving' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {givingProjects.map(gp => (
                  <div key={gp.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm">{gp.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gp.description}</p>
                      <div className="flex justify-between items-center text-[10px] font-bold mt-2 text-primary border-t pt-2">
                        <span>Raised: KSh {gp.current_amount}</span>
                        <span>Target: KSh {gp.target_amount}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete('giving_projects', gp.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Delete Project</button>
                  </div>
                ))}
              </div>
            )}

            {/* REGISTRATIONS LIST MANAGER */}
            {activeTab === 'registrations' && (
              <div className="space-y-3">
                {registrations.map(reg => (
                  <div key={reg.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-sm leading-tight text-primary">{reg.sacrament_type} Application</h4>
                        <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${reg.status === 'approved' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}`}>{reg.status}</span>
                      </div>
                      <p className="text-xs font-extrabold text-foreground mt-1">Candidate: {reg.applicant_name}</p>
                      <p className="text-xs text-muted-foreground">Phone: {reg.phone_number}</p>
                      {reg.parent_names && <p className="text-[10px] text-muted-foreground">Parents: {reg.parent_names}</p>}
                      {reg.date_of_birth && <p className="text-[10px] text-muted-foreground">DOB: {reg.date_of_birth}</p>}
                      {reg.details && Object.keys(reg.details).length > 0 && (
                        <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded mt-2 border">
                          <strong>Details:</strong>
                          <pre className="whitespace-pre-wrap font-sans mt-0.5 text-[9px]">{JSON.stringify(reg.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                    {reg.status === 'pending' && (
                      <button onClick={() => handleUpdateRegStatus(reg.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg self-end sm:self-center shrink-0">Approve Request</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PRAYERS LIST MODERATION WALL */}
            {activeTab === 'prayers' && (
              <div className="space-y-3">
                {prayers.map(p => (
                  <div key={p.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-muted-foreground">
                        <span>Requester: {p.name}</span>
                        <span>•</span>
                        <span>{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-foreground/90 font-sans">{p.intention}</p>
                      <span className="text-[9px] font-bold text-accent">Status: {p.is_moderated ? 'Public Wall' : 'Pending Review'}</span>
                    </div>
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 justify-end">
                      {!p.is_moderated && (
                        <button onClick={() => handleModeratePrayer(p.id, true)} className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20" title="Approve"><Check className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleModeratePrayer(p.id, false)} className="p-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20" title="Delete"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BULLETINS LIST */}
            {activeTab === 'bulletins' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bulletins.map(b => (
                  <div key={b.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm">{b.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Date: {b.publish_date}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={b.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg text-center">View File</a>
                      <button onClick={() => handleDelete('bulletin_archives', b.id)} className="px-2.5 bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SERMONS LIST */}
            {activeTab === 'sermons' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sermons.map(s => (
                  <div key={s.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm leading-snug">{s.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Preacher: {s.preacher} • Scripture: {s.scripture_reference || 'N/A'}</p>
                      <p className="text-xs text-foreground/80 line-clamp-2 mt-1">{s.summary}</p>
                    </div>
                    <button onClick={() => handleDelete('sermons', s.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Delete Sermon</button>
                  </div>
                ))}
              </div>
            )}

            {/* BOOKINGS LIST MODERATION */}
            {activeTab === 'bookings' && (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-sm leading-tight text-foreground">{b.asset_name}</h4>
                        <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${b.status === 'approved' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : b.status === 'rejected' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20'}`}>{b.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Borrower: {b.borrower_name} ({b.borrower_phone})</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Duration: {b.start_date} to {b.end_date}</p>
                    </div>
                    {b.status === 'pending' && (
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button onClick={() => handleUpdateBooking(b.id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600">Approve</button>
                        <button onClick={() => handleUpdateBooking(b.id, 'rejected')} className="px-3 py-1.5 bg-destructive text-white text-xs font-bold rounded-lg hover:bg-destructive-hover">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* HISTORY LIST */}
            {activeTab === 'history' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {historyEntries.map(entry => (
                  <div key={entry.id} className="bg-card border p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-sm">
                    <div>
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{entry.year}</span>
                      <h4 className="font-extrabold text-sm mt-1">{entry.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{entry.content}</p>
                    </div>
                    <button onClick={() => handleDelete('history_entries', entry.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Delete Milestone</button>
                  </div>
                ))}
              </div>
            )}

            {/* GALLERY LIST */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galleryImages.map(img => (
                  <div key={img.id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <img src={img.image_url} className="aspect-square object-cover" />
                    <div className="p-3 space-y-2">
                      <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full block w-fit font-bold">{img.category}</span>
                      <p className="text-xs text-muted-foreground line-clamp-1">{img.caption || 'No caption'}</p>
                      <button onClick={() => handleDelete('gallery_images', img.id)} className="w-full py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* THEME LIST */}
            {activeTab === 'theme' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themes.map(t => (
                  <div key={t.id} className="bg-card border p-4 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm">{t.name}</h4>
                      <div className="flex gap-2 mt-2">
                        <span className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: t.primary_color }} />
                        <span className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: t.secondary_color }} />
                        <span className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: t.background_color }} />
                        <span className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: t.foreground_color }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Months: {t.start_month} to {t.end_month}</p>
                    </div>
                    <button onClick={() => handleDelete('theme_settings', t.id)} className="w-full py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">Remove Theme</button>
                  </div>
                ))}
              </div>
            )}

            {/* ADMINISTRATORS LIST */}
            {activeTab === 'admins' && (
              <div className="space-y-3">
                {administrators.map(admin => (
                  <div key={admin.id} className="flex justify-between items-center p-4 border rounded-2xl bg-card shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-sm text-foreground">{admin.name}</h3>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{admin.role}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                    {session?.user?.email !== admin.email ? (
                      <button onClick={() => handleDelete('administrators', admin.id)} className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-bold rounded-lg shrink-0">Remove Admin</button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-semibold px-2">Current Session</span>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
