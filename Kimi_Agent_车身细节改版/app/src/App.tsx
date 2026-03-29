import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useScrollTo } from '@/hooks/useScrollTo';
import type { Booking, Subscriber, Service, Review, AdminSection, PageSection } from '@/types';
import { 
  Car, Sparkles, Wrench, Shield, Armchair, Gauge, Star,
  Menu, X, ChevronLeft, ChevronRight, Search, Download, Send,
  CheckCircle, AlertCircle, MapPin, Phone, Mail, MessageSquare, User
} from 'lucide-react';

const services: Service[] = [
  { id: 'exterior', icon: 'car', title: 'Exterior Wash & Wax', description: 'Complete hand wash, clay bar treatment, and premium wax application for lasting protection and shine.', price: 79 },
  { id: 'interior', icon: 'sparkles', title: 'Interior Deep Clean', description: 'Full interior detailing including steam cleaning, leather conditioning, and odor elimination.', price: 129 },
  { id: 'paint', icon: 'wrench', title: 'Paint Correction', description: 'Multi-stage polishing to remove swirl marks, scratches, and restore paint clarity and depth.', price: 299 },
  { id: 'ceramic', icon: 'shield', title: 'Ceramic Coating', description: 'Professional-grade ceramic coating application providing 2-5 years of paint protection.', price: 599 },
  { id: 'leather', icon: 'armchair', title: 'Leather Restoration', description: 'Deep cleaning, conditioning, and color restoration for leather seats and interior trim.', price: 199 },
  { id: 'full', icon: 'gauge', title: 'Full Detail Package', description: 'Our comprehensive service combining exterior, interior, and engine bay detailing.', price: 349 },
];

const servicePrices: Record<string, number> = {
  'Exterior Wash & Wax': 79,
  'Interior Deep Clean': 129,
  'Paint Correction': 299,
  'Ceramic Coating': 599,
  'Leather Restoration': 199,
  'Full Detail Package': 349,
};

const timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

// Demo data
const demoBookings: Booking[] = [
  { id: 1, date: '2026-03-20', time: '9:00 AM', name: 'John Smith', phone: '(780) 531-1854', email: 'john@example.com', service: 'Interior Deep Clean', vehicle: '2020 BMW M3', notes: 'First time customer', status: 'pending', created: '2026-03-17' },
  { id: 2, date: '2026-03-21', time: '11:00 AM', name: 'Sarah Johnson', phone: '(780) 370-5551', email: 'sarah@gmail.com', service: 'Interior Deep Clean', vehicle: '2019 Honda Accord', notes: 'Pet hair removal needed', status: 'confirmed', created: '2026-03-16' },
];

const demoSubscribers: Subscriber[] = [
  { email: 'customer1@example.com', date: '2026-03-15', name: 'Jane Doe' },
  { email: 'carlover@gmail.com', date: '2026-03-14', name: 'Car Enthusiast' },
];

const demoReviews: Review[] = [
  { id: 1, name: 'Mike Richardson', rating: 5, comment: 'Absolutely amazing service! My car looks brand new. The attention to detail is incredible.', date: '2026-03-10', service: 'Interior Deep Clean', verified: true },
  { id: 2, name: 'Jessica Chen', rating: 5, comment: 'Best detailing service in town. Professional, punctual, and the results speak for themselves.', date: '2026-03-08', service: 'Interior Deep Clean', verified: true },
  { id: 3, name: 'David Thompson', rating: 4, comment: 'Great work on my truck. Removed all the pet hair and smells fresh. Will definitely book again!', date: '2026-03-05', service: 'Interior Deep Clean', verified: true },
  { id: 4, name: 'Amanda Foster', rating: 5, comment: 'Northern Auto Shine exceeded my expectations. My interior has never looked better!', date: '2026-03-01', service: 'Interior Deep Clean', verified: true },
];

function App() {
  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageSection>('home');
  const scrollTo = useScrollTo();

  // Admin state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [loginError, setLoginError] = useState('');

  // Data state
  const [bookings, setBookings] = useLocalStorage<Booking[]>('bookings', demoBookings);
  const [subscribers, setSubscribers] = useLocalStorage<Subscriber[]>('subscribers', demoSubscribers);
  const [reviews, setReviews] = useLocalStorage<Review[]>('reviews', demoReviews);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Admin filters
  const [searchBookings, setSearchBookings] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchSubscribers, setSearchSubscribers] = useState('');

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{ day: number | null; dateStr: string | null; isDisabled: boolean; isWeekend: boolean; isPast: boolean; isToday: boolean }> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateStr: null, isDisabled: true, isWeekend: false, isPast: false, isToday: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const dayOfWeek = cellDate.getDay();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = cellDate < today;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      const isToday = cellDate.getTime() === today.getTime();

      days.push({
        day,
        dateStr,
        isDisabled: isPast || !isWeekend,
        isWeekend,
        isPast,
        isToday,
      });
    }

    return days;
  }, [currentMonth]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const selectDate = (dateStr: string, isDisabled: boolean) => {
    if (isDisabled) return;
    setSelectedDate(dateStr);
    setBookingError('');
  };

  const handleBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDate) {
      setBookingError('Please select a weekend date (Friday-Sunday) from the calendar.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const newBooking: Booking = {
      id: Date.now(),
      date: selectedDate,
      time: formData.get('time') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      service: formData.get('service') as string,
      vehicle: formData.get('vehicle') as string,
      notes: formData.get('notes') as string,
      status: 'pending',
      created: new Date().toISOString().split('T')[0],
    };

    setBookings(prev => [...prev, newBooking]);
    setBookingSuccess(true);
    setSelectedDate(null);
    e.currentTarget.reset();

    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const handleReviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (reviewRating === 0) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const newReview: Review = {
      id: Date.now(),
      name: formData.get('reviewerName') as string,
      rating: reviewRating,
      comment: formData.get('reviewComment') as string,
      date: new Date().toISOString().split('T')[0],
      service: formData.get('reviewService') as string,
      verified: false,
    };

    setReviews(prev => [newReview, ...prev]);
    setReviewSuccess(true);
    setReviewRating(0);
    e.currentTarget.reset();

    setTimeout(() => setReviewSuccess(false), 5000);
  };

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (username === 'admin' && password === 'password') {
      setAdminLoggedIn(true);
      setAdminModalOpen(false);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Try admin/password for demo.');
    }
  };

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    setSubscribers(prev => [...prev, { email, date: new Date().toISOString().split('T')[0], name: 'Subscriber' }]);
    setNewsletterSuccess(true);
    setNewsletterEmail('');

    setTimeout(() => setNewsletterSuccess(false), 5000);
  };

  const updateBookingStatus = (id: number, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const deleteBooking = (id: number) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const deleteSubscriber = (email: string) => {
    if (confirm('Remove this subscriber?')) {
      setSubscribers(prev => prev.filter(s => s.email !== email));
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ['Date', 'Time', 'Name', 'Email', 'Phone', 'Service', 'Vehicle', 'Status', 'Notes'].join(','),
      ...bookings.map(b => [
        b.date, b.time, b.name, b.email, b.phone, b.service, b.vehicle, b.status, `"${b.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const sendCampaign = () => {
    alert(`Ready to send email campaign to ${subscribers.length} subscribers!\n\nIn production, this would connect to SendGrid or Mailchimp API.`);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = filterStatus === 'all' || b.status === filterStatus;
      const matchSearch = !searchBookings ||
        b.name.toLowerCase().includes(searchBookings.toLowerCase()) ||
        b.email.toLowerCase().includes(searchBookings.toLowerCase()) ||
        b.service.toLowerCase().includes(searchBookings.toLowerCase());
      return matchStatus && matchSearch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings, filterStatus, searchBookings]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s =>
      !searchSubscribers || s.email.toLowerCase().includes(searchSubscribers.toLowerCase())
    );
  }, [subscribers, searchSubscribers]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const revenue = bookings.reduce((sum, b) => sum + (servicePrices[b.service] || 0), 0);
    return { total, pending, confirmed, revenue };
  }, [bookings]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'car': return <Car className="w-12 h-12" />;
      case 'sparkles': return <Sparkles className="w-12 h-12" />;
      case 'wrench': return <Wrench className="w-12 h-12" />;
      case 'shield': return <Shield className="w-12 h-12" />;
      case 'armchair': return <Armchair className="w-12 h-12" />;
      case 'gauge': return <Gauge className="w-12 h-12" />;
      default: return <Car className="w-12 h-12" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'} className={status === 'confirmed' ? 'bg-green-500 text-black' : ''}>{status}</Badge>;
  };

  const renderStars = (rating: number, interactive = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} transition-all duration-200 ${
              star <= (interactive ? reviewHoverRating || reviewRating : rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            } ${interactive ? 'cursor-pointer hover:scale-125' : ''}`}
            onClick={interactive ? () => setReviewRating(star) : undefined}
            onMouseEnter={interactive ? () => setReviewHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setReviewHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Reviews Page Component
  const ReviewsPage = () => (
    <div className="min-h-screen bg-[#050505] pt-20">
      {/* Reviews Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/texture-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-wider animate-fade-in-up">
              Customer <span className="animated-gradient-text">Reviews</span>
            </h1>
            <p className="text-xl text-[#888] max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              See what our customers are saying about Northern Auto Shine
            </p>
            
            {/* Rating Summary */}
            <div className="mt-12 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-7xl font-bold mb-2">{averageRating}</div>
              <div className="flex gap-1 mb-2">
                {renderStars(Number(averageRating))}
              </div>
              <div className="text-[#888]">Based on {reviews.length} reviews</div>
            </div>
          </div>

          {/* Write a Review Form */}
          <Card className="max-w-2xl mx-auto mb-16 bg-[#0a0a0a]/90 border-[#dc2626]/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
                <MessageSquare className="w-6 h-6 text-[#dc2626]" />
                Share Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewSuccess && (
                <Alert className="mb-6 bg-green-500/20 border-green-500 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>Thank you for your review! It will be posted after verification.</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <Label className="text-center block mb-3">Your Rating *</Label>
                  <div className="flex justify-center">
                    {renderStars(reviewRating, true, 'lg')}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reviewerName">Your Name *</Label>
                  <Input
                    id="reviewerName"
                    name="reviewerName"
                    required
                    placeholder="John Doe"
                    className="bg-[#141414] border-[#333] text-white focus:border-[#dc2626]"
                  />
                </div>

                <div>
                  <Label htmlFor="reviewService">Service Received *</Label>
                  <Select name="reviewService" required defaultValue="Interior Deep Clean">
                    <SelectTrigger className="bg-[#141414] border-[#333] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-[#333]">
                      <SelectItem value="Interior Deep Clean">Interior Deep Clean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reviewComment">Your Review *</Label>
                  <Textarea
                    id="reviewComment"
                    name="reviewComment"
                    required
                    rows={4}
                    placeholder="Tell us about your experience..."
                    className="bg-[#141414] border-[#333] text-white resize-none focus:border-[#dc2626]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#dc2626] hover:bg-[#991b1b] text-white py-6 text-lg font-semibold uppercase tracking-wider"
                >
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, idx) => (
              <Card 
                key={review.id} 
                className="review-card bg-[#0a0a0a]/80 border-[#333] backdrop-blur-sm"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{review.name}</span>
                        {review.verified && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(review.rating, false, 'sm')}
                        <span className="text-sm text-[#666]">{review.date}</span>
                      </div>
                      <p className="text-[#aaa] mb-2">"{review.comment}"</p>
                      <p className="text-sm text-[#dc2626]">Service: {review.service}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  // Main Page Content
  const MainPage = () => (
    <>
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]" />
        </div>
        
        {/* Animated Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#dc2626]/15 rounded-full blur-[200px] animate-pulse-glow" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up">
            <img 
              src="/logo.png" 
              alt="Northern Auto Shine" 
              className="w-48 h-48 md:w-64 md:h-64 mx-auto animate-float"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-wider animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Northern <span className="animated-gradient-text">Auto Shine</span>
          </h1>
          <p className="text-lg md:text-xl text-[#aaa] mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Professional interior detailing that brings your vehicle back to showroom condition. 
            We treat every car like it's our own.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              onClick={() => scrollTo('booking')}
              className="bg-[#dc2626] hover:bg-[#991b1b] text-white px-8 py-6 text-lg font-semibold uppercase tracking-wider shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
            >
              Book Now
            </Button>
            <Button 
              onClick={() => scrollTo('services')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-semibold uppercase tracking-wider"
            >
              Our Services
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/texture-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 uppercase tracking-wider">
            Our <span className="animated-gradient-text">Services</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const isAvailable = service.id === 'interior';
              return (
                <Card 
                  key={service.id} 
                  className={`relative bg-[#0a0a0a]/90 border-[#333] backdrop-blur-sm transition-all duration-500 ${
                    isAvailable 
                      ? 'hover:border-[#dc2626] hover:-translate-y-3 hover:shadow-xl hover:shadow-red-500/20 group' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-[#050505]/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <div className="bg-[#dc2626] text-white px-6 py-3 rounded-lg font-bold text-lg uppercase tracking-wider shadow-lg">
                          Coming Soon
                        </div>
                      </div>
                    )}
                    
                    <div className={`text-[#dc2626] mb-6 ${isAvailable ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}>
                      {getServiceIcon(service.icon)}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-[#888] mb-6">{service.description}</p>
                    <div className="text-[#dc2626] font-bold text-lg">
                      {isAvailable ? (
                        <div>
                          <div>$100 - $300</div>
                          <div className="text-sm text-[#666] font-normal mt-1">
                            *Price depends on vehicle condition
                          </div>
                        </div>
                      ) : (
                        `Starting at $${service.price}`
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 uppercase tracking-wider">
            Book <span className="animated-gradient-text">Appointment</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendar */}
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Weekend Availability Only</h3>
                <p className="text-[#888]">
                  We operate Friday through Sunday to ensure quality service. 
                  Select your preferred weekend date below.
                </p>
              </div>

              <Card className="bg-[#0a0a0a]/90 border-[#333] backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <button 
                      onClick={() => changeMonth(-1)}
                      className="p-2 hover:bg-[#141414] rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button 
                      onClick={() => changeMonth(1)}
                      className="p-2 hover:bg-[#141414] rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-bold text-[#dc2626]">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((dayInfo, idx) => (
                      <div
                        key={idx}
                        onClick={() => dayInfo.dateStr && selectDate(dayInfo.dateStr, dayInfo.isDisabled)}
                        className={`
                          calendar-day
                          ${!dayInfo.day ? 'invisible' : ''}
                          ${dayInfo.isDisabled ? 'disabled' : 'available'}
                          ${selectedDate === dayInfo.dateStr ? 'selected' : ''}
                          ${dayInfo.isToday ? 'today' : ''}
                        `}
                      >
                        {dayInfo.day}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6 text-sm text-[#888]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#141414] border-2 border-[#10b981]/50 rounded" />
                      <span>Available (Fri-Sun)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#0a0a0a] border border-[#333] rounded" />
                      <span>Not Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#dc2626] rounded" />
                      <span>Selected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div>
              <Card className="bg-[#0a0a0a]/90 border-[#333] backdrop-blur-sm">
                <CardContent className="p-6">
                  {bookingSuccess && (
                    <Alert className="mb-6 bg-green-500/20 border-green-500 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>Booking request submitted! We'll contact you shortly to confirm.</AlertDescription>
                    </Alert>
                  )}
                  
                  {bookingError && (
                    <Alert className="mb-6 bg-red-500/20 border-red-500 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{bookingError}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <Label htmlFor="selectedDate">Selected Date *</Label>
                      <Input
                        id="selectedDate"
                        name="selectedDate"
                        value={selectedDate || ''}
                        placeholder="Click a weekend date on calendar"
                        readOnly
                        className="bg-[#141414] border-[#333] text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="John Doe"
                        className="bg-[#141414] border-[#333] text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="(780) 531-1854"
                        className="bg-[#141414] border-[#333] text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="bg-[#141414] border-[#333] text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="service">Service Type *</Label>
                      <Select name="service" required defaultValue="Interior Deep Clean">
                        <SelectTrigger className="bg-[#141414] border-[#333] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#333]">
                          <SelectItem value="Interior Deep Clean">
                            Interior Deep Clean ($100 - $300)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-[#666] mt-2">
                        *Price depends on vehicle condition. The dirtier the car, the more it will cost.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="vehicle">Vehicle Info (Year, Make, Model) *</Label>
                      <Input
                        id="vehicle"
                        name="vehicle"
                        required
                        placeholder="2020 Toyota Camry"
                        className="bg-[#141414] border-[#333] text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select name="time" defaultValue="9:00 AM">
                        <SelectTrigger className="bg-[#141414] border-[#333] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#333]">
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Any specific concerns or requests..."
                        className="bg-[#141414] border-[#333] text-white resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#dc2626] hover:bg-[#991b1b] text-white py-6 text-lg font-semibold uppercase tracking-wider"
                    >
                      Request Booking
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/texture-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 uppercase tracking-wider">
            Contact <span className="animated-gradient-text">Us</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#0a0a0a]/90 border-[#333] backdrop-blur-sm text-center hover:border-[#dc2626] transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                  <MapPin className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Location</h3>
                <p className="text-[#888]">
                  To be determined
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a]/90 border-[#333] backdrop-blur-sm text-center hover:border-[#dc2626] transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                  <Phone className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Phone</h3>
                <p className="text-[#888]">
                  (780) 531-1854<br />
                  (780) 370-5551
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a]/90 border-[#333] backdrop-blur-sm text-center hover:border-[#dc2626] transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                  <Mail className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <p className="text-[#888]">
                  northautoshine@gmail.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <img 
            src="/logo.png" 
            alt="Northern Auto Shine" 
            className="w-24 h-24 mx-auto mb-6"
          />
          <div className="text-2xl font-bold mb-4">
            Northern <span className="text-[#dc2626]">Auto Shine</span>
          </div>
          <p className="text-[#666] mb-8">
            Professional interior detailing services. Quality results guaranteed.
          </p>

          <div className="max-w-md mx-auto mb-8">
            <h4 className="text-lg font-semibold mb-4">Subscribe for Updates & Offers</h4>
            {newsletterSuccess && (
              <Alert className="mb-4 bg-green-500/20 border-green-500 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>Thank you for subscribing!</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                name="email"
                type="email"
                value={newsletterEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-[#141414] border-[#333] text-white"
              />
              <Button type="submit" className="bg-[#dc2626] hover:bg-[#991b1b] text-white">
                Subscribe
              </Button>
            </form>
          </div>

          <p className="text-[#444] text-sm">
            © 2026 Northern Auto Shine. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );

  if (adminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="w-12 h-12" />
              <h2 className="text-2xl font-bold">
                <span className="text-[#dc2626]">Management</span> Dashboard
              </h2>
            </div>
            <Tabs value={adminSection} onValueChange={(v: string) => setAdminSection(v as AdminSection)} className="w-full lg:w-auto">
              <TabsList className="bg-[#141414]">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#dc2626]">Overview</TabsTrigger>
                <TabsTrigger value="bookings" className="data-[state=active]:bg-[#dc2626]">Bookings</TabsTrigger>
                <TabsTrigger value="subscribers" className="data-[state=active]:bg-[#dc2626]">Subscribers</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={() => setAdminLoggedIn(false)} className="border-[#dc2626] text-white hover:bg-[#dc2626]">
              Logout
            </Button>
          </div>

          {/* Overview Section */}
          {adminSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#666] uppercase">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#666] uppercase">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.pending}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#666] uppercase">Confirmed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.confirmed}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#666] uppercase">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${stats.revenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#666] uppercase">Subscribers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{subscribers.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#666] uppercase">Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{reviews.length}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                <CardHeader>
                  <CardTitle className="text-[#dc2626]">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.slice(-5).reverse().length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(-5).reverse().map(booking => (
                        <div key={booking.id} className="flex justify-between items-center p-3 bg-[#141414] rounded-lg">
                          <div>
                            <span className="font-semibold">{booking.name}</span> booked{' '}
                            <span className="text-[#dc2626]">{booking.service}</span>
                            <div className="text-sm text-[#666]">{booking.date} at {booking.time}</div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#666] text-center py-8">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bookings Section */}
          {adminSection === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <Input
                    placeholder="Search by name, email, or service..."
                    value={searchBookings}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchBookings(e.target.value)}
                    className="pl-10 bg-[#141414] border-[#333] text-white"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] bg-[#141414] border-[#333] text-white">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#333]">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportBookings} variant="outline" className="border-[#333] text-white hover:bg-[#141414]">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>

              <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                          <TableHead className="text-[#dc2626]">Date & Time</TableHead>
                          <TableHead className="text-[#dc2626]">Client</TableHead>
                          <TableHead className="text-[#dc2626]">Service</TableHead>
                          <TableHead className="text-[#dc2626]">Vehicle</TableHead>
                          <TableHead className="text-[#dc2626]">Status</TableHead>
                          <TableHead className="text-[#dc2626]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map(booking => (
                          <TableRow key={booking.id} className="border-[#1a1a1a] hover:bg-[#141414]/50">
                            <TableCell>
                              <div>{booking.date}</div>
                              <div className="text-sm text-[#666]">{booking.time}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">{booking.name}</div>
                              <div className="text-sm text-[#666]">{booking.email}</div>
                              <div className="text-sm text-[#666]">{booking.phone}</div>
                            </TableCell>
                            <TableCell>{booking.service}</TableCell>
                            <TableCell>{booking.vehicle}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {booking.status === 'pending' && (
                                  <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="bg-green-500 text-black hover:bg-green-600">
                                    Confirm
                                  </Button>
                                )}
                                {booking.status === 'confirmed' && (
                                  <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'completed')} className="bg-blue-500 text-white hover:bg-blue-600">
                                    Complete
                                  </Button>
                                )}
                                <Button size="sm" variant="destructive" onClick={() => deleteBooking(booking.id)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  {filteredBookings.length === 0 && (
                    <p className="text-[#666] text-center py-8">No bookings found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscribers Section */}
          {adminSection === 'subscribers' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchSubscribers}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchSubscribers(e.target.value)}
                    className="pl-10 bg-[#141414] border-[#333] text-white"
                  />
                </div>
                <Button onClick={sendCampaign} className="bg-green-500 text-black hover:bg-green-600">
                  <Send className="w-4 h-4 mr-2" /> Send Campaign
                </Button>
              </div>

              <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y divide-[#1a1a1a]">
                      {filteredSubscribers.map((subscriber, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 hover:bg-[#141414]/50">
                          <div>
                            <div className="font-semibold">{subscriber.email}</div>
                            <div className="text-sm text-[#666]">Subscribed on {subscriber.date}</div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => deleteSubscriber(subscriber.email)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {filteredSubscribers.length === 0 && (
                    <p className="text-[#666] text-center py-8">No subscribers found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#dc2626]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <button 
              onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3"
            >
              <img src="/logo.png" alt="Northern Auto Shine" className="w-14 h-14" />
              <div className="hidden sm:block text-xl font-bold tracking-wider">
                NORTHERN <span className="text-[#dc2626]">AUTO SHINE</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => { setCurrentPage('home'); scrollTo('home'); }} className="text-sm font-medium uppercase tracking-wider hover:text-[#dc2626] transition-colors">
                Home
              </button>
              <button onClick={() => { setCurrentPage('home'); scrollTo('services'); }} className="text-sm font-medium uppercase tracking-wider hover:text-[#dc2626] transition-colors">
                Services
              </button>
              <button onClick={() => { setCurrentPage('home'); scrollTo('booking'); }} className="text-sm font-medium uppercase tracking-wider hover:text-[#dc2626] transition-colors">
                Booking
              </button>
              <button onClick={() => setCurrentPage('reviews')} className="text-sm font-medium uppercase tracking-wider hover:text-[#dc2626] transition-colors">
                Reviews
              </button>
              <button onClick={() => { setCurrentPage('home'); scrollTo('contact'); }} className="text-sm font-medium uppercase tracking-wider hover:text-[#dc2626] transition-colors">
                Contact
              </button>
              <Button 
                onClick={() => setAdminModalOpen(true)}
                className="bg-[#dc2626] hover:bg-[#991b1b] text-white"
              >
                Admin
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t border-[#1a1a1a] animate-slide-in">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); scrollTo('home'); }} className="block w-full text-left py-2 hover:text-[#dc2626] transition-colors">
                Home
              </button>
              <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); scrollTo('services'); }} className="block w-full text-left py-2 hover:text-[#dc2626] transition-colors">
                Services
              </button>
              <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); scrollTo('booking'); }} className="block w-full text-left py-2 hover:text-[#dc2626] transition-colors">
                Booking
              </button>
              <button onClick={() => { setCurrentPage('reviews'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:text-[#dc2626] transition-colors">
                Reviews
              </button>
              <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); scrollTo('contact'); }} className="block w-full text-left py-2 hover:text-[#dc2626] transition-colors">
                Contact
              </button>
              <Button 
                onClick={() => { setAdminModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full bg-[#dc2626] hover:bg-[#991b1b] text-white"
              >
                Admin Login
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {currentPage === 'reviews' ? <ReviewsPage /> : <MainPage />}

      {/* Admin Login Modal */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border-2 border-[#dc2626] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Admin <span className="text-[#dc2626]">Login</span>
            </DialogTitle>
          </DialogHeader>
          
          {loginError && (
            <Alert className="bg-red-500/20 border-red-500 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="admin"
                required
                className="bg-[#141414] border-[#333] text-white"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                required
                className="bg-[#141414] border-[#333] text-white"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#dc2626] hover:bg-[#991b1b] text-white"
            >
              Login
            </Button>
          </form>
          
          <p className="text-center text-sm text-[#666]">
            Demo: admin / password
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
