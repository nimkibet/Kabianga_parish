'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, AlertCircle, FileText, Loader2, Send } from 'lucide-react';

export default function SacramentalRegistration() {
  const [sacramentType, setSacramentType] = useState('Baptism');
  const [applicantName, setApplicantName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [parentNames, setParentNames] = useState('');
  
  // Matrimony specific fields
  const [spouseName, setSpouseName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  
  // Catechism specific
  const [localChurch, setLocalChurch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Structure additional details depending on sacrament type
    const details: Record<string, any> = {};
    if (sacramentType === 'Matrimony') {
      details.spouse_name = spouseName;
      details.wedding_date_proposal = weddingDate;
    }
    if (sacramentType === 'Catechism') {
      details.local_church_center = localChurch;
    }

    try {
      const { error } = await supabase.from('sacramental_registrations').insert({
        sacrament_type: sacramentType,
        applicant_name: applicantName,
        date_of_birth: dateOfBirth || null,
        parent_names: parentNames || null,
        phone_number: phone,
        details: details,
        status: 'pending',
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Your registration application has been submitted successfully! The parish secretary will contact you for verification and further guidelines.',
      });

      // Clear inputs
      setApplicantName('');
      setDateOfBirth('');
      setPhone('');
      setParentNames('');
      setSpouseName('');
      setWeddingDate('');
      setLocalChurch('');

    } catch (err: any) {
      setMessage({ type: 'error', text: `Registration failed: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 px-1 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Sacramental Life
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Sacrament Registry</h1>
        <p className="text-xs text-muted-foreground">Digital registration for Baptism, Confirmation, Matrimony & Catechism</p>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        
        {message && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-start space-x-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sacrament Type Selector */}
          <div className="space-y-1">
            <label htmlFor="sacrament-type" className="text-xs font-bold text-muted-foreground">1. Select Sacrament / Program</label>
            <select
              id="sacrament-type"
              value={sacramentType}
              onChange={(e) => setSacramentType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input font-bold"
            >
              <option value="Baptism">Holy Baptism (Ubatizo)</option>
              <option value="Confirmation">Confirmation (Kipaimara)</option>
              <option value="Matrimony">Holy Matrimony (Ndoa Takatifu)</option>
              <option value="Catechism">Catechism Classes (Kipaimara/Ubatizo Kujifunza)</option>
            </select>
          </div>

          {/* Applicant Name */}
          <div className="space-y-1">
            <label htmlFor="applicant" className="text-xs font-bold text-muted-foreground">
              {sacramentType === 'Matrimony' ? '2. Bride / Groom Name' : '2. Full Name of Candidate'}
            </label>
            <input
              id="applicant"
              type="text"
              required
              placeholder="Enter full official names..."
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
            />
          </div>

          {/* Date of Birth (not for Matrimony as much, but useful for child records) */}
          {sacramentType !== 'Matrimony' && (
            <div className="space-y-1">
              <label htmlFor="dob" className="text-xs font-bold text-muted-foreground">3. Date of Birth</label>
              <input
                id="dob"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
              />
            </div>
          )}

          {/* Parent Details for Baptism / Confirmation / Catechism */}
          {['Baptism', 'Confirmation', 'Catechism'].includes(sacramentType) && (
            <div className="space-y-1">
              <label htmlFor="parents" className="text-xs font-bold text-muted-foreground">
                4. Parents / Guardian Names (Optional)
              </label>
              <input
                id="parents"
                type="text"
                placeholder="Father's & Mother's Names"
                value={parentNames}
                onChange={(e) => setParentNames(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
              />
            </div>
          )}

          {/* Matrimony specific spouse info */}
          {sacramentType === 'Matrimony' && (
            <>
              <div className="space-y-1">
                <label htmlFor="spouse" className="text-xs font-bold text-muted-foreground">3. Fiancé / Spouse Name</label>
                <input
                  id="spouse"
                  type="text"
                  required
                  placeholder="Enter Fiancé's full name..."
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="wedding-date" className="text-xs font-bold text-muted-foreground">4. Proposed Wedding Date</label>
                <input
                  id="wedding-date"
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
                />
              </div>
            </>
          )}

          {/* Catechism Local church center */}
          {sacramentType === 'Catechism' && (
            <div className="space-y-1">
              <label htmlFor="church-center" className="text-xs font-bold text-muted-foreground">5. Local Church / Outstation Center</label>
              <input
                id="church-center"
                type="text"
                required
                placeholder="e.g. St. Peters, Kabianga Central"
                value={localChurch}
                onChange={(e) => setLocalChurch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
              />
            </div>
          )}

          {/* Phone Number */}
          <div className="space-y-1">
            <label htmlFor="phone" className="text-xs font-bold text-muted-foreground">Contact Phone Number</label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all touch-friendly-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full touch-target bg-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit Registration Request</span>
          </button>

        </form>
      </div>

      {/* Security note */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
        <h4 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" />
          Data Confidentiality Policy
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          🔒 All registrations are securely stored in our parish database. Submissions are encrypted and only accessible by authorized parish administration (Parish Priest & Secretary) for sacramental registry purposes. Information will not be shared with third parties.
        </p>
      </div>

    </div>
  );
}
