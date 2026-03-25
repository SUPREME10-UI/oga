import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Wallet, X, Loader2, FileText } from 'lucide-react';

export default function BookingModal({ isOpen, onClose, artisan }) {
  const { createBooking } = useData();
  const { user } = useAuth();

  const [form, setForm] = useState({
    jobTitle: '',
    description: '',
    location: '',
    date: '',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !artisan) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobTitle.trim()) {
      alert('Please enter a job title.');
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({
        hirerId: user?.uid || user?.id,
        hirerName: user?.name || user?.displayName || 'Hirer',
        labourerId: artisan.id,
        labourerName: artisan.name || artisan.displayName,
        labourerProfession: artisan.profession || '',
        jobTitle: form.jobTitle,
        description: form.description,
        location: form.location || artisan.location || '',
        preferredDate: form.date,
        budget: form.budget,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm({ jobTitle: '', description: '', location: '', date: '', budget: '' });
        onClose();
      }, 2000);
    } catch (err) {
      alert('Failed to send booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="hero-gradient px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-serif">Book an Artisan</h2>
            <p className="text-white/70 text-sm mt-0.5">
              Sending request to{' '}
              <span className="text-white font-semibold">
                {artisan.name || 'this artisan'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artisan badge */}
        <div className="px-6 py-3 border-b border-border bg-secondary/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full craft-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(artisan.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{artisan.name}</p>
            <p className="text-xs text-muted-foreground">{artisan.profession || 'Artisan'}</p>
          </div>
          {artisan.hourlyRate && (
            <Badge variant="secondary" className="ml-auto">
              GH₵{artisan.hourlyRate}/hr
            </Badge>
          )}
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold font-serif text-lg mb-1">Request Sent!</h3>
            <p className="text-muted-foreground text-sm">
              {artisan.name} will be notified and can accept or decline your request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <FileText className="w-4 h-4 inline mr-1.5 text-primary" />
                What do you need done? <span className="text-red-500">*</span>
              </label>
              <Input
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Fix leaking kitchen pipe"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Additional Details</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the work in more detail..."
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <MapPin className="w-4 h-4 inline mr-1 text-primary" />
                  Location
                </label>
                <Input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Accra, East Legon"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1 text-primary" />
                  Preferred Date
                </label>
                <Input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Wallet className="w-4 h-4 inline mr-1 text-primary" />
                Budget (GH₵)
              </label>
              <Input
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 200 (optional)"
                type="number"
                min="0"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  'Send Booking Request'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
