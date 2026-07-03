/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, BedDouble, Bath, Square, Sparkles, SlidersHorizontal, Info, Compass, ArrowRightLeft, Calendar, User, Building2, Check, Phone, Mail, HelpCircle, Eye, AlertCircle, RefreshCw, Upload, CreditCard, FileText } from 'lucide-react';
import { Property, BrokerProfile, AgentProfile, Inquiry, Appointment } from '../types';

interface WebPortalProps {
  properties: Property[];
  brokers: BrokerProfile[];
  agents: AgentProfile[];
  onAddInquiry: (inq: any) => void;
  onAddAppointment: (apt: any) => void;
  onSubmitProperty: (prop: any) => void;
  currentUserRole: string;
}

export default function WebPortal({
  properties,
  brokers,
  agents,
  onAddInquiry,
  onAddAppointment,
  onSubmitProperty,
  currentUserRole,
}: WebPortalProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSubCity, setSelectedSubCity] = useState<string>('All');
  const [priceMax, setPriceMax] = useState<number>(500000000);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  
  // Forms state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryMethod, setInquiryMethod] = useState<'Phone' | 'Telegram' | 'WhatsApp' | 'Email' | 'Live Chat'>('Live Chat');

  // Checkout Payment Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [chkName, setChkName] = useState('');
  const [chkPhone, setChkPhone] = useState('');
  const [chkEmail, setChkEmail] = useState('');
  const [chkGateway, setChkGateway] = useState<'Telebirr' | 'CBE Birr' | 'Chapa' | 'SantimPay' | 'Stripe' | 'PayPal'>('Telebirr');
  const [chkTxId, setChkTxId] = useState('');
  const [chkReceipt, setChkReceipt] = useState('');
  const [chkSubmitting, setChkSubmitting] = useState(false);
  const [chkSuccess, setChkSuccess] = useState(false);
  const [chkError, setChkError] = useState('');

  // Submit property state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages(prev => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file as any);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const [newPropForm, setNewPropForm] = useState({
    title: '',
    description: '',
    price: 150000,
    currency: 'ETB' as 'ETB' | 'USD',
    type: 'Apartment' as any,
    category: 'Residential' as any,
    purpose: 'Rent' as any,
    bedrooms: 2,
    bathrooms: 2,
    garage: true,
    kitchen: true,
    livingRooms: 1,
    balcony: true,
    area: 120,
    floor: 3,
    buildingAge: 1,
    address: 'Bole, near Bole Medhanialem',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Bole',
    woreda: 'Woreda 03',
    nearbySchools: 'Bole High School',
    nearbyHospitals: 'Hayat Hospital',
    nearbyBanks: 'CBE',
    nearbyRoads: 'Bole Road',
    water: true,
    electricity: true,
    internet: true,
    parking: true,
    security: true,
    furnished: true,
    swimmingPool: false,
    garden: false,
    ownershipStatus: 'Clean Title' as any,
    propertyCondition: 'Excellent' as any,
    brokerId: '',
  });

  // AI Feature States
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPriceResult, setAiPriceResult] = useState<any>(null);
  const [aiPriceLoading, setAiPriceLoading] = useState(false);

  // Simulated Map coordinates & active focus marker
  const [mapFocusedProperty, setMapFocusedProperty] = useState<Property | null>(null);

  // Filter listings
  const filteredProperties = properties.filter((p) => {
    if (p.status !== 'active') return false;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPurpose = selectedPurpose === 'All' || p.purpose === selectedPurpose;
    const matchesType = selectedType === 'All' || p.type === selectedType;
    const matchesSubCity = selectedSubCity === 'All' || p.subCity.toLowerCase() === selectedSubCity.toLowerCase();
    const matchesPrice = p.price <= priceMax || (p.currency === 'USD' && p.price * 120 <= priceMax);
    const matchesBeds = p.bedrooms >= minBedrooms;

    return matchesSearch && matchesCategory && matchesPurpose && matchesType && matchesSubCity && matchesPrice && matchesBeds;
  });

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    setChkSubmitting(true);
    setChkError('');
    setChkSuccess(false);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          propertyTitle: selectedProperty.title,
          buyerName: chkName,
          buyerPhone: chkPhone,
          buyerEmail: chkEmail,
          price: selectedProperty.price,
          currency: selectedProperty.currency,
          paymentGateway: chkGateway,
          transactionId: chkTxId,
          receiptUrl: chkReceipt || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&q=80',
          status: 'pending_approval',
          brokerId: selectedProperty.brokerId || 'broker-1'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChkSuccess(true);
        setTimeout(() => {
          setShowCheckoutModal(false);
          setChkSuccess(false);
          setChkName('');
          setChkPhone('');
          setChkEmail('');
          setChkTxId('');
          setChkReceipt('');
        }, 3000);
      } else {
        setChkError(data.error || 'Failed to submit transaction.');
      }
    } catch (err) {
      console.error(err);
      setChkError('Connection error. Could not post payment receipt.');
    } finally {
      setChkSubmitting(false);
    }
  };

  // AI Generators calls
  const handleGenerateAIDescription = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedProperty?.title || 'Luxury Apartment',
          type: selectedProperty?.type,
          city: selectedProperty?.city,
          subCity: selectedProperty?.subCity,
          bedrooms: selectedProperty?.bedrooms,
          amenities: [
            selectedProperty?.swimmingPool ? 'Swimming Pool' : '',
            selectedProperty?.security ? '24/7 Security' : '',
            selectedProperty?.furnished ? 'Fully Furnished' : '',
            selectedProperty?.garden ? 'Private Garden' : '',
            selectedProperty?.internet ? 'High-speed Fiber Internet' : '',
          ].filter(Boolean)
        })
      });
      const data = await response.json();
      setAiDescription(data.description);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleEstimateAIPrice = async () => {
    setAiPriceLoading(true);
    try {
      const response = await fetch('/api/ai/price-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedProperty?.type,
          city: selectedProperty?.city,
          subCity: selectedProperty?.subCity,
          bedrooms: selectedProperty?.bedrooms,
          area: selectedProperty?.area,
          condition: selectedProperty?.propertyCondition,
        })
      });
      const data = await response.json();
      setAiPriceResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiPriceLoading(false);
    }
  };

  // Toggle Property comparison
  const handleToggleCompare = (property: Property) => {
    if (compareList.some(p => p.id === property.id)) {
      setCompareList(compareList.filter(p => p.id !== property.id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 properties at a time.");
        return;
      }
      setCompareList([...compareList, property]);
    }
    setShowCompareDrawer(true);
  };

  // Handle appointment submit
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !aptDate) {
      alert("Please fill in all details.");
      return;
    }
    onAddAppointment({
      propertyId: selectedProperty?.id,
      propertyTitle: selectedProperty?.title,
      customerId: 'cust-' + Date.now(),
      customerName: custName,
      customerPhone: custPhone,
      date: aptDate,
      time: aptTime,
      brokerId: selectedProperty?.brokerId || 'broker-1',
      agentId: selectedProperty?.agentId,
    });
    alert(`Appointment successfully requested for ${aptDate} at ${aptTime}! The assigned broker will confirm soon.`);
    setShowAppointmentModal(false);
    setCustName('');
    setCustPhone('');
  };

  // Handle live inquiry submit
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !inquiryMsg) {
      alert("Please enter your name and message.");
      return;
    }
    onAddInquiry({
      propertyId: selectedProperty?.id,
      propertyTitle: selectedProperty?.title,
      customerName: custName,
      customerEmail: 'customer@gmail.com',
      customerPhone: custPhone || '+251 900 000 000',
      message: inquiryMsg,
      method: inquiryMethod,
      brokerId: selectedProperty?.brokerId || 'broker-1',
      agentId: selectedProperty?.agentId,
    });
    alert(`Your Inquiry has been sent via ${inquiryMethod}! The broker/agent has received it and will reply immediately.`);
    setInquiryMsg('');
  };

  // Submit owner property
  const handleSubmitOwnerProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropForm.title || !newPropForm.description) {
      alert("Please fill in title and description.");
      return;
    }
    onSubmitProperty({
      ...newPropForm,
      images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
      status: 'pending_review', // Owner submissions must be approved by admin
      isPremium: false,
      isFeatured: false,
    });
    
    if (newPropForm.brokerId) {
      alert("Listing submitted successfully! It has been routed to the selected broker's review queue. It will go live once verified by the broker and approved by the system Admin.");
    } else {
      alert("Listing submitted successfully! It has been submitted directly to the platform queue. It will go live once approved by the system Admin.");
    }
    
    setUploadedImages([]);
    setShowSubmitModal(false);
  };

  return (
    <div id="web-portal-section" className="pb-12">
      {/* Hero Visual Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white mb-8 p-8 md:p-16 shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 mb-4 border border-sky-500/20">
            <Sparkles className="w-3 h-3" /> Real Estate Ecosystem
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight leading-tight mb-4">
            Find Your Dream Space in <span className="text-sky-400">Ethiopia</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
            The unified platform synchronizing Web Portal, Android Application, and Telegram Bots in real-time under a single centralized registry.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              id="owner-submit-btn"
              onClick={() => setShowSubmitModal(true)}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 font-medium rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Submit Your Property (Owner)
            </button>
            <a 
              href="#listings-grid"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 font-medium rounded-xl text-sm transition-all border border-white/10 flex items-center gap-2"
            >
              Browse Active Listings
            </a>
          </div>
        </div>
      </div>

      {/* Main Control Pane: Search Filter Panel */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              id="property-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, sub-city, keywords..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all w-full md:w-auto ${
                showFilters ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 bg-white focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
              <option value="Special">Special Listings</option>
            </select>
          </div>
        </div>

        {/* Extended Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Purpose</label>
                  <select
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white"
                  >
                    <option value="All">Any (Sale / Rent / Lease)</option>
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                    <option value="Lease">For Lease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sub-city (Addis Ababa)</label>
                  <select
                    value={selectedSubCity}
                    onChange={(e) => setSelectedSubCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white"
                  >
                    <option value="All">All Sub-cities</option>
                    <option value="Bole">Bole</option>
                    <option value="Kirkos">Kirkos / Kazanchis</option>
                    <option value="Addis Ketema">Addis Ketema / Mercato</option>
                    <option value="Yeka">Yeka / CMC</option>
                    <option value="Akaki-Kality">Akaki-Kality</option>
                    <option value="Nifas Silk">Nifas Silk / Old Airport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Max Price (ETB / Equiv)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50000"
                      max="150000000"
                      step="50000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                      {priceMax >= 150000000 ? 'Any' : `${(priceMax / 1000000).toFixed(1)}M`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Min Bedrooms</label>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setMinBedrooms(num)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${
                          minBedrooms === num ? 'bg-sky-500 border-sky-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {num === 0 ? 'Any' : `${num}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Double Section: Grid + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Property Listings */}
        <div id="listings-grid" className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-slate-800">
              Active Listings ({filteredProperties.length})
            </h2>
            <p className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Status: Centralized Database Synced
            </p>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No properties match your current filters</p>
              <p className="text-sm text-slate-400 mt-1">Try broadening your search keywords or resetting pricing limits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  id={`property-card-${p.id}`}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all group duration-300 relative ${
                    mapFocusedProperty?.id === p.id 
                      ? 'border-sky-500 ring-4 ring-sky-100 shadow-md scale-[1.02]' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'
                  }`}
                >
                  {/* Visual Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {p.isPremium && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                    {p.isFeatured && (
                      <span className="bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  <span className="absolute top-3 right-3 z-10 bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    For {p.purpose}
                  </span>

                  {/* Property Image Cover */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-sky-600 font-mono text-[11px] font-semibold mb-1">
                      <span>{p.category}</span>
                      <span>•</span>
                      <span>{p.type}</span>
                    </div>

                    <h3 className="font-bold font-display text-slate-800 text-sm group-hover:text-sky-600 transition-colors line-clamp-1 mb-2">
                      {p.title}
                    </h3>

                    <div className="flex items-center text-slate-400 text-xs gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{p.address}, {p.city}</span>
                    </div>

                    {/* Numeric parameters bento tags */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 mb-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.area} m²</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-none">Price</p>
                        <p className="text-lg font-bold text-slate-900 font-display mt-0.5">
                          {p.currency} {p.price.toLocaleString()}
                          {p.purpose === 'Rent' && <span className="text-xs font-normal text-slate-500">/mo</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleCompare(p)}
                          className={`p-2 rounded-lg border transition-all ${
                            compareList.some(comp => comp.id === p.id) 
                              ? 'bg-amber-50 border-amber-200 text-amber-600' 
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                          title="Compare Property"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProperty(p);
                            setMapFocusedProperty(p);
                            setAiDescription('');
                            setAiPriceResult(null);
                          }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-sky-600 text-white font-medium text-xs rounded-xl transition-all"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Simulated Interactive Map of Addis Ababa */}
        <div className="lg:col-span-5 sticky top-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-500 animate-spin-slow" />
              <h2 className="text-base font-bold font-display text-slate-800">
                Interactive Addis Ababa Map
              </h2>
            </div>
            <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded">Vector Simulator</span>
          </div>

          <p className="text-xs text-slate-500 leading-normal mb-4">
            Click on coordinates or property pins to check exact service coordinates, distances, and landmarks.
          </p>

          {/* Map Vector Box */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            {/* Map Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>
            
            {/* Map Roads Vector Lines */}
            <svg className="absolute inset-0 w-full h-full text-slate-300 opacity-60" fill="none">
              <path d="M 0,200 L 400,200" stroke="currentColor" strokeWidth="4" />
              <path d="M 200,0 L 200,400" stroke="currentColor" strokeWidth="4" />
              <path d="M 50,50 L 350,350" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
              <path d="M 50,350 L 350,50" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
              
              {/* Ring Road ring outline */}
              <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="3" />
            </svg>

            {/* Neighborhood Labels on Vector Map */}
            <div className="absolute top-8 left-12 text-[10px] font-bold text-slate-400">Addis Ketema</div>
            <div className="absolute top-1/4 right-14 text-[10px] font-bold text-slate-400">Yeka / CMC</div>
            <div className="absolute bottom-1/4 left-10 text-[10px] font-bold text-slate-400">Kirkos</div>
            <div className="absolute bottom-10 right-20 text-[10px] font-bold text-slate-400">Bole District</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">Akaki-Kality</div>

            {/* Central Landmark Pin (Sheraton Addis / Edna Mall center point) */}
            <div className="absolute left-[200px] top-[200px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-white"></div>
              <span className="text-[9px] font-mono text-slate-500 font-bold bg-white px-1 rounded shadow-sm border mt-1">City Center</span>
            </div>

            {/* Render Property pins dynamically on map */}
            {properties.filter(p => p.status === 'active').map((p) => {
              // Map lat/long to grid percentage
              // Lat Addis Ababa is around 9.00 to 9.03, Long is around 38.74 to 38.82
              const xPercent = 10 + ((p.longitude - 38.74) / (38.83 - 38.74)) * 80;
              const yPercent = 90 - ((p.latitude - 8.75) / (9.04 - 8.75)) * 80;

              const isFocused = mapFocusedProperty?.id === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setMapFocusedProperty(p);
                    setSelectedProperty(p);
                  }}
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 flex flex-col items-center"
                >
                  <div className="relative">
                    <MapPin className={`w-6 h-6 drop-shadow-md transition-all ${
                      isFocused ? 'text-sky-500 scale-125' : 'text-slate-700 hover:text-sky-500'
                    }`} />
                    {/* Tiny premium dot inside pin */}
                    {p.isPremium && (
                      <span className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    )}
                  </div>
                  {/* Tooltip on hover/active */}
                  <div className={`mt-1 text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
                    isFocused ? 'opacity-100 scale-105' : ''
                  }`}>
                    {p.type}: {p.currency} {(p.price / 1000).toFixed(0)}k
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Marker Details Panel */}
          {mapFocusedProperty && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-center">
              <img
                src={mapFocusedProperty.images[0]}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{mapFocusedProperty.title}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-500" /> Lat: {mapFocusedProperty.latitude}, Lng: {mapFocusedProperty.longitude}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-extrabold text-sky-600">{mapFocusedProperty.currency} {mapFocusedProperty.price.toLocaleString()}</p>
                <span className="text-[9px] text-slate-400">Distance to center: ~2.4 km</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details Drawer / Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col relative"
            >
              {/* Drawer Sticky Header */}
              <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-sky-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    Verified Listing
                  </span>
                  <span className="font-mono text-xs text-slate-400">ID: {selectedProperty.id}</span>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-500 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                {/* Images grid carousel */}
                <div className="grid grid-cols-12 gap-3 h-64">
                  <div className="col-span-8 h-full bg-slate-100 rounded-2xl overflow-hidden relative">
                    <img
                      src={selectedProperty.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="col-span-4 flex flex-col gap-3 h-full">
                    {selectedProperty.images.slice(1, 3).map((img, i) => (
                      <div key={i} className="h-[48%] bg-slate-100 rounded-2xl overflow-hidden">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spec title and price */}
                <div>
                  <h2 className="text-2xl font-bold font-display text-slate-900">{selectedProperty.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <p className="text-2xl font-extrabold text-sky-600 font-display">
                      {selectedProperty.currency} {selectedProperty.price.toLocaleString()}
                      {selectedProperty.purpose === 'Rent' && <span className="text-sm font-normal text-slate-500"> / month</span>}
                    </p>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      Property Category: {selectedProperty.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Property Overview</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* AI Features Suite */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
                    <h3 className="text-sm font-bold font-display text-slate-800">
                      PropertyHub AI Assistant Services
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500">
                    Utilize generative Gemini-AI parameters to write property briefs or evaluate market rates.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleGenerateAIDescription}
                      disabled={aiLoading}
                      className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Generate AI Marketing Description
                    </button>

                    <button
                      onClick={handleEstimateAIPrice}
                      disabled={aiPriceLoading}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {aiPriceLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Info className="w-3.5 h-3.5" />}
                      Estimate AI Price Range
                    </button>
                  </div>

                  {/* Render generated AI desc */}
                  {aiDescription && (
                    <div className="bg-white rounded-xl p-4 border border-sky-100 text-xs text-slate-700 leading-relaxed font-sans space-y-2">
                      <p className="font-bold text-sky-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Gemini AI Generated Description
                      </p>
                      <div className="whitespace-pre-wrap">{aiDescription}</div>
                    </div>
                  )}

                  {/* Render Price Estimation */}
                  {aiPriceResult && (
                    <div className="bg-white rounded-xl p-4 border border-sky-100 text-xs text-slate-700 space-y-3">
                      <p className="font-bold text-sky-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> AI Valuation Price Estimates
                      </p>
                      <p className="leading-normal">{aiPriceResult.analysis}</p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 p-2.5 rounded-lg border">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Range (ETB)</span>
                          <span className="text-sm font-extrabold text-slate-800">{aiPriceResult.estimatedPriceRangeETB?.formatted || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Range (USD)</span>
                          <span className="text-sm font-extrabold text-sky-600">{aiPriceResult.estimatedPriceRangeUSD?.formatted || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Influencing valuation criteria:</p>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                          {aiPriceResult.influencingFactors?.map((f: string, idx: number) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic specs details matrix */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Property Specifics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Bedrooms</span>
                      <p className="text-base font-bold text-slate-800 mt-1">{selectedProperty.bedrooms} Beds</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Bathrooms</span>
                      <p className="text-base font-bold text-slate-800 mt-1">{selectedProperty.bathrooms} Baths</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Area</span>
                      <p className="text-base font-bold text-slate-800 mt-1">{selectedProperty.area} sqm</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Floor Level</span>
                      <p className="text-base font-bold text-slate-800 mt-1">Level {selectedProperty.floor}</p>
                    </div>
                  </div>
                </div>

                {/* Amenities checklist */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Amenities & Utilities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Water Reserve', active: selectedProperty.water },
                      { label: 'Electricity Grid', active: selectedProperty.electricity },
                      { label: 'Fiber Internet', active: selectedProperty.internet },
                      { label: 'Car Parking', active: selectedProperty.parking },
                      { label: '24/7 Security Guard', active: selectedProperty.security },
                      { label: 'Fully Furnished', active: selectedProperty.furnished },
                      { label: 'Swimming Pool', active: selectedProperty.swimmingPool },
                      { label: 'Private Garden', active: selectedProperty.garden },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          item.active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs ${item.active ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitting Inquiry Section */}
                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Contact broker information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Assigned Agent Info</h3>
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                        <User className="w-full h-full text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Yonas Kebede</p>
                        <p className="text-xs text-slate-500">Verified Agent • Habesha Elite Realty</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-sky-500" /> +251 911 888 777</p>
                      <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-sky-500" /> yonas@habeshaelite.com</p>
                    </div>

                    <button
                      onClick={() => setShowAppointmentModal(true)}
                      className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Physical Viewing Tour
                    </button>

                    <button
                      onClick={() => {
                        setChkName(custName);
                        setChkPhone(custPhone);
                        setShowCheckoutModal(true);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md mt-2 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Secure Property (Buy/Rent)
                    </button>
                  </div>

                  {/* Right: Live Chat contact form */}
                  <form onSubmit={handleSendInquiry} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Instantly Message Broker</h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full p-2 text-xs bg-white rounded-lg border border-slate-200"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Your Phone Number"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full p-2 text-xs bg-white rounded-lg border border-slate-200"
                      />
                      <textarea
                        placeholder="Type your inquiry message..."
                        rows={3}
                        value={inquiryMsg}
                        onChange={(e) => setInquiryMsg(e.target.value)}
                        className="w-full p-2 text-xs bg-white rounded-lg border border-slate-200"
                        required
                      ></textarea>
                    </div>

                    <div className="flex gap-2 items-center justify-between">
                      <select
                        value={inquiryMethod}
                        onChange={(e: any) => setInquiryMethod(e.target.value)}
                        className="p-1.5 text-[10px] bg-white border rounded-md"
                      >
                        <option value="Live Chat">Live Chat</option>
                        <option value="Telegram">Telegram Channel</option>
                        <option value="WhatsApp">WhatsApp Message</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-sky-600 text-white text-xs font-medium rounded-lg"
                      >
                        Send Inquiry
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout / Payment Modal */}
      <AnimatePresence>
        {showCheckoutModal && selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full relative text-xs"
            >
              <h2 className="text-lg font-bold font-display text-slate-900 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Secure Property Booking
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Verify details and submit your bank transaction receipt to lock this property list.
              </p>

              {chkSuccess ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-100 text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-sm">Receipt Registered Successfully!</h3>
                  <p className="text-xs leading-normal">
                    Your payment receipt of <strong>{selectedProperty.price.toLocaleString()} {selectedProperty.currency}</strong> has been submitted to <strong>{brokers.find(b => b.id === selectedProperty.brokerId)?.companyName || 'the assigned broker'}</strong> for verification. 
                  </p>
                  <p className="text-[10px] text-slate-400">
                    The property listing status will change to Rent/Sold immediately once approved.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {/* Property short specs */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-bold text-sky-500 uppercase">Target Property</span>
                    <h4 className="font-bold text-slate-800 text-[11px] truncate">{selectedProperty.title}</h4>
                    <p className="font-extrabold text-xs text-emerald-700">
                      Amount due: {selectedProperty.price.toLocaleString()} {selectedProperty.currency} ({selectedProperty.purpose === 'Rent' ? 'Rent Fee' : 'Sale Price'})
                    </p>
                  </div>

                  {chkError && (
                    <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{chkError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        placeholder="Alula Kebede"
                        value={chkName}
                        onChange={(e) => setChkName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Your Phone</label>
                        <input
                          type="tel"
                          placeholder="+251..."
                          value={chkPhone}
                          onChange={(e) => setChkPhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Your Email</label>
                        <input
                          type="email"
                          placeholder="name@domain.com"
                          value={chkEmail}
                          onChange={(e) => setChkEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Select Payment Gateway</label>
                      <select
                        value={chkGateway}
                        onChange={(e: any) => setChkGateway(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Telebirr">Telebirr Mobile Payment</option>
                        <option value="CBE Birr">CBE Birr App / Transfer</option>
                        <option value="Chapa">Chapa Payment Link</option>
                        <option value="SantimPay">SantimPay Digital Gate</option>
                        <option value="Stripe">Stripe International Card</option>
                        <option value="PayPal">PayPal Digital Wallet</option>
                      </select>
                    </div>

                    {/* Instructions Box based on gateway */}
                    <div className="p-3 bg-sky-50 text-sky-800 rounded-xl border border-sky-100 text-[10px] leading-relaxed">
                      {chkGateway === 'Telebirr' && (
                        <span><strong>Telebirr Transfer:</strong> Dial 127, transfer to merchant ID <strong>128956</strong> or phone number <strong>+251 911 888 777</strong>. Enter transaction details below.</span>
                      )}
                      {chkGateway === 'CBE Birr' && (
                        <span><strong>CBE Direct Deposit:</strong> Send money to account <strong>1000155448899</strong> (Habesha Elite Realty). Specify the receipt ref ID.</span>
                      )}
                      {chkGateway === 'Chapa' && (
                        <span><strong>Chapa Gateway:</strong> Submit your invoice reference or Chapa tracking ID code here to map transaction handshakes.</span>
                      )}
                      {chkGateway === 'SantimPay' && (
                        <span><strong>SantimPay Transfer:</strong> Specify SantimPay wallet code or direct invoice receipt token.</span>
                      )}
                      {['Stripe', 'PayPal'].includes(chkGateway) && (
                        <span><strong>International Transfer:</strong> Charge code or authorization ref ID must match stripe logs.</span>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Transaction ID / Reference Number</label>
                      <input
                        type="text"
                        placeholder="e.g., CBE-TXN-984725"
                        value={chkTxId}
                        onChange={(e) => setChkTxId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Attach Receipt Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="Paste image link, or leave blank for automatic mockup"
                        value={chkReceipt}
                        onChange={(e) => setChkReceipt(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={chkSubmitting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1"
                    >
                      {chkSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Payment Receipt'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Appointment Modal */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full relative"
            >
              <h2 className="text-lg font-bold font-display text-slate-900 mb-2">Book a Property Viewing</h2>
              <p className="text-xs text-slate-500 mb-4">
                Schedule a face-to-face physical tour accompanied by our verified property broker.
              </p>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Select Time Window</label>
                  <select
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="10:00 AM">Morning (10:00 AM)</option>
                    <option value="02:00 PM">Afternoon (02:00 PM)</option>
                    <option value="04:30 PM">Evening (04:30 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Alula Kebede"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Your Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g., +251 911 00 11 22"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs rounded-xl shadow-md"
                  >
                    Confirm Tour Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Owner Submission Property Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Submit Property for Listing</h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the listing parameters. Your property is immediately dispatched to your selected local broker for verification review.
              </p>

              <form onSubmit={handleSubmitOwnerProperty} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Listing Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Gorgeous G+1 Family House in Bole CMC"
                      value={newPropForm.title}
                      onChange={(e) => setNewPropForm({ ...newPropForm, title: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Description Brief</label>
                    <textarea
                      placeholder="Details about building age, amenities, security, road connectivity..."
                      rows={3}
                      value={newPropForm.description}
                      onChange={(e) => setNewPropForm({ ...newPropForm, description: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={newPropForm.price}
                      onChange={(e) => setNewPropForm({ ...newPropForm, price: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Currency</label>
                    <select
                      value={newPropForm.currency}
                      onChange={(e: any) => setNewPropForm({ ...newPropForm, currency: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs bg-white"
                    >
                      <option value="ETB">Birr (ETB)</option>
                      <option value="USD">Dollars (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Category</label>
                    <select
                      value={newPropForm.category}
                      onChange={(e: any) => setNewPropForm({ ...newPropForm, category: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs bg-white"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                      <option value="Special">Special Listings</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Specific Type</label>
                    <select
                      value={newPropForm.type}
                      onChange={(e: any) => setNewPropForm({ ...newPropForm, type: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs bg-white"
                    >
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Condominium">Condominium</option>
                      <option value="Studio">Studio</option>
                      <option value="Office">Office</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Residential Land">Residential Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Purpose</label>
                    <select
                      value={newPropForm.purpose}
                      onChange={(e: any) => setNewPropForm({ ...newPropForm, purpose: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs bg-white"
                    >
                      <option value="Sale">Sale</option>
                      <option value="Rent">Rent</option>
                      <option value="Lease">Lease</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Assign Broker Reviewer (Optional)</label>
                    <select
                      value={newPropForm.brokerId}
                      onChange={(e) => setNewPropForm({ ...newPropForm, brokerId: e.target.value })}
                      className="w-full p-2 rounded-lg border text-xs bg-white"
                    >
                      <option value="">None (Direct Platform Submission)</option>
                      {brokers.filter(b => b.status === 'approved').map(b => (
                        <option key={b.id} value={b.id}>{b.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 border border-dashed border-slate-200 p-4 rounded-xl">
                    <label className="block font-bold text-slate-700 mb-1">Upload Property Pictures</label>
                    <p className="text-[10px] text-slate-400 mb-3">Add beautiful photos of your property to attract potential buyers.</p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <p className="text-[11px] text-slate-500 font-medium">Click to select files or drag-and-drop</p>
                          </div>
                          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                      
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2 max-h-36 overflow-y-auto">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                              <img src={img} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full text-[10px] opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center w-4 h-4"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={newPropForm.bedrooms}
                      onChange={(e) => setNewPropForm({ ...newPropForm, bedrooms: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Area (sqm)</label>
                    <input
                      type="number"
                      value={newPropForm.area}
                      onChange={(e) => setNewPropForm({ ...newPropForm, area: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border text-xs"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 font-medium text-slate-500 hover:bg-slate-50 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-xs"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Property Comparison Matrix Drawer */}
      <AnimatePresence>
        {showCompareDrawer && compareList.length > 0 && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-2xl p-4 flex flex-col">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                  <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Property Comparison Matrix ({compareList.length}/3)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompareList([])}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowCompareDrawer(false)}
                    className="text-[10px] text-sky-600 hover:text-sky-700 font-bold"
                  >
                    Minimize
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                {/* Specs label column */}
                <div className="space-y-2 pt-16 font-semibold text-slate-400">
                  <div className="h-8 flex items-center">Price</div>
                  <div className="h-8 flex items-center">Property Type</div>
                  <div className="h-8 flex items-center">Total Area</div>
                  <div className="h-8 flex items-center">Bed/Bath</div>
                  <div className="h-8 flex items-center">Amenities</div>
                </div>

                {/* Properties columns */}
                {compareList.map((p) => (
                  <div key={p.id} className="border border-slate-100 rounded-xl p-2 bg-slate-50 relative">
                    <button
                      onClick={() => setCompareList(compareList.filter(item => item.id !== p.id))}
                      className="absolute top-1 right-1 text-slate-400 hover:text-slate-600 font-bold text-[9px]"
                    >
                      ✕
                    </button>
                    <div className="h-14 mb-2 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-400">{p.city}</p>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="h-8 flex items-center font-extrabold text-sky-600">{p.currency} {p.price.toLocaleString()}</div>
                      <div className="h-8 flex items-center text-slate-600">{p.type}</div>
                      <div className="h-8 flex items-center text-slate-600">{p.area} m²</div>
                      <div className="h-8 flex items-center text-slate-600">{p.bedrooms} Bed / {p.bathrooms} Bath</div>
                      <div className="h-8 flex items-center text-[10px] text-slate-500 truncate">
                        {[
                          p.swimmingPool ? 'Pool' : '',
                          p.security ? 'Security' : '',
                          p.furnished ? 'Furnished' : ''
                        ].filter(Boolean).join(', ') || 'Standard'}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty column slots */}
                {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <div key={idx} className="border border-dashed border-slate-200 rounded-xl p-6 flex items-center justify-center text-slate-400 text-[10px] font-medium text-center">
                    Select listing to compare
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
