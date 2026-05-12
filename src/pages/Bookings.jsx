import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar, MapPin, Wallet, User, CheckCircle, XCircle, Clock, Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  Pending:  { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="w-3.5 h-3.5" /> },
  Accepted: { badge: 'bg-green-100 text-green-700 border-green-200',  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Declined: { badge: 'bg-red-100 text-red-700 border-red-200',        icon: <XCircle className="w-3.5 h-3.5" /> },
  Completed:{ badge: 'bg-blue-100 text-blue-700 border-blue-200',     icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

export default function Bookings() {
  const { bookings, updateBookingStatus } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState('incoming');

  const userId = user?.uid || user?.id;
  const isLabourer = user?.type === 'labourer';

  // Incoming = bookings where this user is the artisan (labourer sees these)
  const incoming = bookings.filter((b) => String(b.labourerId) === String(userId));
  // Sent = bookings this user created as a hirer
  const sent = bookings.filter((b) => String(b.hirerId) === String(userId));

  const currentList = isLabourer
    ? (activeTab === 'incoming' ? incoming : sent)
    : (activeTab === 'sent' ? sent : incoming);

  const handleStatus = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif">Bookings</h1>
        <p className="text-muted-foreground text-sm">
          {isLabourer ? 'Manage booking requests from hirers.' : 'Track your booking requests.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {isLabourer && (
          <>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'incoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Incoming ({incoming.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sent'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              My Requests ({sent.length})
            </button>
          </>
        )}
        {!isLabourer && (
          <button
            className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary"
          >
            Sent Requests ({sent.length})
          </button>
        )}
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Briefcase className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="font-semibold font-serif mb-1">No Bookings Yet</h3>
          <p className="text-muted-foreground text-sm">
            {activeTab === 'incoming'
              ? 'Booking requests from hirers will appear here.'
              : 'Your sent booking requests will appear here.'}
          </p>
          {!isLabourer && (
            <Button className="mt-4" size="sm" onClick={() => navigate('/explore')}>
              Find Artisans
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => {
            const style = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;
            const isIncoming = String(booking.labourerId) === String(userId);
            const canAct = isIncoming && booking.status === 'Pending';

            return (
              <Card key={booking.id} className="border-border">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg font-serif truncate">{booking.jobTitle}</h3>
                        <Badge className={`border flex-shrink-0 flex items-center gap-1 ${style.badge}`}>
                          {style.icon}
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isIncoming
                          ? `Requested by ${booking.hirerName}`
                          : `To: ${booking.labourerName} (${booking.labourerProfession || 'Artisan'})`}
                      </p>
                    </div>

                    {/* View profile button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/profile/${isIncoming ? booking.hirerId : booking.labourerId}`)}
                    >
                      <User className="w-4 h-4 mr-1.5" />
                      View Profile
                    </Button>
                  </div>

                  {/* Details grid */}
                  <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
                    {booking.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                    )}
                    {booking.preferredDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{new Date(booking.preferredDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    {booking.budget && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground">GH₵{booking.budget}</span>
                      </div>
                    )}
                  </div>

                  {booking.description && (
                    <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2 mb-4 leading-relaxed">
                      {booking.description}
                    </p>
                  )}

                  {/* Actions for artisan on pending bookings */}
                  {canAct && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        disabled={updating === booking.id}
                        onClick={() => handleStatus(booking.id, 'Accepted')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        {updating === booking.id ? 'Updating...' : 'Accept'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        size="sm"
                        disabled={updating === booking.id}
                        onClick={() => handleStatus(booking.id, 'Declined')}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {/* Mark complete (artisan on accepted) */}
                  {isIncoming && booking.status === 'Accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      disabled={updating === booking.id}
                      onClick={() => handleStatus(booking.id, 'Completed')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Mark as Completed
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    Received {booking.date || 'recently'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
