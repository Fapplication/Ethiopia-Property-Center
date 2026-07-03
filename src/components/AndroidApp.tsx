/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Battery, Wifi, Signal, Search, Home as HomeIcon, MapPin, Heart, User, Sun, Moon, Sparkles, Database, Bell, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Property } from '../types';

interface AndroidAppProps {
  properties: Property[];
}

export default function AndroidApp({ properties }: AndroidAppProps) {
  const [phoneTheme, setPhoneTheme] = useState<'light' | 'dark'>('light');
  const [phoneTab, setPhoneTab] = useState<'home' | 'search' | 'favorites'>('home');
  const [offlineCache, setOfflineCache] = useState(true);
  const [selectedMobileProp, setSelectedMobileProp] = useState<Property | null>(null);
  const [favoritesList, setFavoritesList] = useState<string[]>(['prop-1', 'prop-2']);
  const [simulatedNotification, setSimulatedNotification] = useState<string | null>(null);

  // Auto-trigger simulated notification if properties list updates
  useEffect(() => {
    if (properties.length > 6) {
      setSimulatedNotification("Ethiopia Property Hub: A new prime listing has been synced in your area!");
      const timer = setTimeout(() => setSimulatedNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [properties.length]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favoritesList.includes(id)) {
      setFavoritesList(favoritesList.filter(fId => fId !== id));
    } else {
      setFavoritesList([...favoritesList, id]);
    }
  };

  const activeProperties = properties.filter(p => p.status === 'active');
  const favoriteProperties = activeProperties.filter(p => favoritesList.includes(p.id));

  return (
    <div id="android-app-section" className="flex flex-col xl:flex-row items-center justify-center gap-10 py-4">
      
      {/* Left Column: Phone Frame Controls */}
      <div className="max-w-sm space-y-4 text-center xl:text-left">
        <span className="bg-sky-500/10 text-sky-500 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-500/20 inline-flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 animate-bounce" /> Android App Simulator
        </span>
        <h2 className="text-xl font-bold font-display text-slate-800">High-Fidelity Mobile Client</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Experience Ethiopia Property Hub compiled as a native Android client. Switch themes, toggle local offline cache status, and receive real-time push notification toasts synchronized with database mutations.
        </p>

        <div className="space-y-2.5 pt-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5"><Sun className="w-4 h-4 text-amber-500" /> Phone Theme Mode</span>
            <button
              onClick={() => setPhoneTheme(phoneTheme === 'light' ? 'dark' : 'light')}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-sky-600 text-[10px] font-bold transition-colors"
            >
              Toggle {phoneTheme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5"><Database className="w-4 h-4 text-sky-500" /> Local Offline Cache</span>
            <button
              onClick={() => setOfflineCache(!offlineCache)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                offlineCache ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {offlineCache ? 'Cache Active' : 'Cache Disabled'}
            </button>
          </div>

          {/* Trigger Toast button */}
          <button
            onClick={() => {
              setSimulatedNotification("Habesha Elite: Yonas Kebede replied to your Bole Villa inquiry!");
              setTimeout(() => setSimulatedNotification(null), 5000);
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 border"
          >
            <Bell className="w-4 h-4 text-sky-500 animate-swing" /> Trigger Mock Push Notification
          </button>
        </div>
      </div>

      {/* Right Column: Premium CSS Android Phone Shell Container */}
      <div className="relative">
        {/* Device Wrapper */}
        <div className="relative mx-auto w-[310px] h-[610px] rounded-[42px] border-[12px] border-slate-900 bg-slate-950 shadow-2xl overflow-hidden ring-4 ring-slate-800">
          
          {/* Top Notch/Speaker */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-800 rounded-full mb-1"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 ml-2 mb-1"></div>
          </div>

          {/* SIMULATED PHONE DISPLAY SCREEN */}
          <div className={`w-full h-full flex flex-col relative font-sans select-none transition-colors duration-300 ${
            phoneTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
          }`}>
            
            {/* Phone Status Bar (Top) */}
            <div className="pt-5 px-5 pb-2 flex justify-between items-center text-[10px] font-mono z-40">
              <span className="font-bold">10:13 AM</span>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Simulated Notification slide-in */}
            <AnimatePresence>
              {simulatedNotification && (
                <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 8, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  className="absolute left-3 right-3 bg-slate-950/90 backdrop-blur text-white p-3 rounded-2xl shadow-xl z-50 flex gap-2.5 items-start border border-white/10"
                >
                  <Bell className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0 animate-bounce" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-sky-400">Push Alert Synced</p>
                    <p className="text-[10px] leading-relaxed line-clamp-2">{simulatedNotification}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Offline Cache Indicator */}
            {offlineCache && (
              <div className="bg-emerald-500 text-white text-[9px] font-bold py-0.5 text-center flex items-center justify-center gap-1 z-30">
                <Check className="w-3 h-3" /> Offline Caching Activated • Fast Load On
              </div>
            )}

            {/* PHONE SCREEN BODY */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 relative">
              
              {/* SCREEN: HOME PAGE */}
              {phoneTab === 'home' && !selectedMobileProp && (
                <div className="space-y-4">
                  {/* Header visual */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Addis Ababa, ET</p>
                      <h3 className="text-sm font-extrabold font-display leading-none mt-0.5">Ethiopia Property Hub</h3>
                    </div>
                    <span className="p-1.5 bg-sky-500 text-white rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Search box placeholder */}
                  <button 
                    onClick={() => setPhoneTab('search')}
                    className="w-full p-2.5 rounded-xl border flex items-center gap-2 text-[11px] text-slate-400 bg-white/40 border-slate-200"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400" /> Search premium apartments, land...
                  </button>

                  {/* Horizontal Scroll Carousel */}
                  <div>
                    <h4 className="text-xs font-bold font-display text-slate-400 mb-2.5">Featured Premium Listings</h4>
                    <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none">
                      {activeProperties.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedMobileProp(p)}
                          className={`w-40 flex-shrink-0 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative transition-all ${
                            phoneTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
                          }`}
                        >
                          <img src={p.images[0]} alt="" className="h-24 w-full object-cover" referrerPolicy="no-referrer" />
                          <div className="p-2.5">
                            <span className="text-[8px] bg-sky-100 text-sky-700 px-1 py-0.2 rounded font-bold uppercase">{p.type}</span>
                            <p className="font-bold text-[10px] truncate text-slate-800 mt-1 leading-none">{p.title}</p>
                            <p className="text-[10px] font-extrabold text-sky-600 mt-1 font-mono">{p.currency} {p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vertical Lists of properties */}
                  <div>
                    <h4 className="text-xs font-bold font-display text-slate-400 mb-2.5">Latest Properties Feed</h4>
                    <div className="space-y-3">
                      {activeProperties.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedMobileProp(p)}
                          className={`p-2.5 rounded-2xl border flex gap-3 shadow-sm transition-all ${
                            phoneTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                          }`}
                        >
                          <img src={p.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[11px] truncate leading-tight">{p.title}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{p.city}, {p.subCity}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-[11px] font-extrabold text-sky-600 font-mono">{p.currency} {p.price.toLocaleString()}</p>
                              <button
                                onClick={(e) => toggleFavorite(p.id, e)}
                                className={`p-1 rounded-full ${
                                  favoritesList.includes(p.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${favoritesList.includes(p.id) ? 'fill-rose-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SCREEN: SEARCH / EXPLORE LISTINGS */}
              {phoneTab === 'search' && !selectedMobileProp && (
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold font-display">Explore Database Properties</h3>
                  
                  {/* Search layout */}
                  <div className="space-y-2">
                    {activeProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedMobileProp(p)}
                        className={`p-3 rounded-xl border flex gap-2.5 items-center justify-between ${
                          phoneTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
                        }`}
                      >
                        <div className="flex gap-2 items-center min-w-0">
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div className="min-w-0">
                            <p className="font-bold text-[10px] truncate">{p.title}</p>
                            <span className="text-[8px] text-slate-400">{p.type} • {p.subCity}</span>
                          </div>
                        </div>
                        <p className="font-bold text-[10px] text-sky-500 font-mono">{p.currency} {p.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN: FAVORITES LIST */}
              {phoneTab === 'favorites' && !selectedMobileProp && (
                <div className="space-y-3.5">
                  <h3 className="text-xs font-bold font-display">Saved Favorites ({favoriteProperties.length})</h3>
                  
                  {favoriteProperties.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-[11px]">
                      <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No saved properties yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {favoriteProperties.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedMobileProp(p)}
                          className={`p-2.5 rounded-2xl border flex gap-3 shadow-sm transition-all ${
                            phoneTheme === 'dark' ? 'bg-slate-800' : 'bg-white'
                          }`}
                        >
                          <img src={p.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[10px] truncate">{p.title}</p>
                            <p className="text-[10px] font-extrabold text-sky-600 mt-1 font-mono">{p.currency} {p.price.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(p.id, e)}
                            className="text-rose-500 p-1 self-center"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN: MOBILE DETAIL MODEL VIEW */}
              {selectedMobileProp && (
                <div className="space-y-4">
                  {/* Back button */}
                  <button
                    onClick={() => setSelectedMobileProp(null)}
                    className="p-1 px-2.5 text-[9px] font-bold rounded-lg border flex items-center gap-1 text-slate-500 hover:bg-slate-100"
                  >
                    ← Back to catalog
                  </button>

                  <img src={selectedMobileProp.images[0]} alt="" className="w-full h-32 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  
                  <div>
                    <span className="text-[8px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-extrabold uppercase">{selectedMobileProp.type}</span>
                    <h3 className="font-bold text-xs mt-1 leading-tight">{selectedMobileProp.title}</h3>
                    <p className="text-[13px] font-extrabold text-sky-600 mt-1 font-mono">{selectedMobileProp.currency} {selectedMobileProp.price.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-0.5"><MapPin className="w-3 h-3 text-sky-500" /> {selectedMobileProp.address}, {selectedMobileProp.city}</p>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal border-t pt-2.5">
                    {selectedMobileProp.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-100/70 text-[10px] space-y-1.5 border border-slate-200 text-slate-700">
                    <p className="font-bold text-sky-600">Assigned Broker Agent:</p>
                    <p>Agent Name: <span className="font-bold">Yonas Kebede</span></p>
                    <p>Agency: <span className="font-semibold">Habesha Elite Realty</span></p>
                    <p>Phone: <span className="font-mono text-sky-600">+251 911 888 777</span></p>
                  </div>

                  <button
                    onClick={() => {
                      alert("Tapping phone dialer link... In production this opens the Android dialer app.");
                    }}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Call Agent Now
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Android Navigation Bar Mockup */}
            <div className={`pt-2.5 pb-5 border-t flex justify-around items-center text-[9px] font-bold z-40 ${
              phoneTheme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <button
                onClick={() => { setPhoneTab('home'); setSelectedMobileProp(null); }}
                className={`flex flex-col items-center gap-1 ${phoneTab === 'home' ? 'text-sky-500' : 'text-slate-400'}`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => { setPhoneTab('search'); setSelectedMobileProp(null); }}
                className={`flex flex-col items-center gap-1 ${phoneTab === 'search' ? 'text-sky-500' : 'text-slate-400'}`}
              >
                <Search className="w-4 h-4" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => { setPhoneTab('favorites'); setSelectedMobileProp(null); }}
                className={`flex flex-col items-center gap-1 ${phoneTab === 'favorites' ? 'text-sky-500' : 'text-slate-400'}`}
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
