/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Smartphone, Bot, Shield, User, HelpCircle, Code, Layers, Sparkles, RefreshCw, AlertCircle, Database } from 'lucide-react';

import WebPortal from './components/WebPortal';
import AndroidApp from './components/AndroidApp';
import TelegramBot from './components/TelegramBot';
import BrokerDashboard from './components/BrokerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ApiDocs from './components/ApiDocs';

import { Property, BrokerProfile, AgentProfile, Inquiry, Appointment, ChatMessage, UserSubscription, AuditLog, AppSettings } from './types';

type RoleTab = 'portal' | 'android' | 'telegram' | 'broker' | 'admin' | 'api';

export default function App() {
  const [activeTab, setActiveTab] = useState<RoleTab>('portal');
  
  // Real synchronization database states
  const [properties, setProperties] = useState<Property[]>([]);
  const [brokers, setBrokers] = useState<BrokerProfile[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    telegramBotActive: true,
    androidMaintenanceMode: false,
    pushNotificationsCount: 148,
    approvedAdsCount: 5,
  });

  const [loading, setLoading] = useState(true);
  const [syncCount, setSyncCount] = useState(0);

  // Load database items on mount & sync triggers
  const fetchDatabase = async () => {
    try {
      const [
        resProps,
        resBrokers,
        resAgents,
        resInquiries,
        resApts,
        resChats,
        resSubs,
        resLogs,
        resSettings,
      ] = await Promise.all([
        fetch('/api/properties').then(r => r.json()),
        fetch('/api/brokers').then(r => r.json()),
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/inquiries').then(r => r.json()),
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/chat').then(r => r.json()),
        fetch('/api/subscriptions').then(r => r.json()),
        fetch('/api/logs').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
      ]);

      setProperties(resProps);
      setBrokers(resBrokers);
      setAgents(resAgents);
      setInquiries(resInquiries);
      setAppointments(resApts);
      setChatMessages(resChats);
      setSubscriptions(resSubs);
      setLogs(resLogs);
      setAppSettings(resSettings);
    } catch (err) {
      console.error("Database connection issue. Using initial values.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, [syncCount]);

  // Periodic slow polling to keep roles in absolute real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncCount(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // MUTATION: Add Property Listing
  const handleAddProperty = async (newProp: any) => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Delete Property
  const handleDeleteProperty = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update Property status
  const handleUpdatePropertyStatus = async (id: string, status: any) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update premium indicators
  const handleUpdatePropertyPremium = async (id: string, field: 'isPremium' | 'isFeatured', val: boolean) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: val }),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update Broker registration
  const handleUpdateBrokerStatus = async (id: string, status: any) => {
    try {
      const response = await fetch(`/api/brokers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Submit Inquiry
  const handleAddInquiry = async (inq: any) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inq),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Schedule tour appointment
  const handleAddAppointment = async (apt: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apt),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Respond to tour
  const handleUpdateAppointmentStatus = async (id: string, status: any) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update Inquiry Responded
  const handleUpdateInquiryStatus = async (id: string, status: any) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Send Chat message
  const handleSendChatMessage = async (msg: any) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update general app configurations
  const handleUpdateSettings = async (settings: any) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Purchase Premium subscription
  const handlePurchaseSubscription = async (sub: any) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div id="loading-screen" className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mb-4" />
        <p className="font-bold text-sm tracking-wide uppercase text-slate-500">Synchronizing database handshakes...</p>
        <p className="text-xs text-slate-400 mt-1">Booting unified full-stack ecosystem modules</p>
      </div>
    );
  }

  return (
    <div id="applet-viewport" className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Dynamic Sync Banner */}
      <div className="bg-sky-600 text-white text-[11px] font-medium py-2 px-4 flex justify-between items-center border-b border-sky-500/30">
        <span className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Live Central Database Synced
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="opacity-75">Properties: {properties.length}</span>
          <span className="opacity-40">•</span>
          <span className="opacity-75">Brokers: {brokers.length}</span>
          <span className="opacity-40">•</span>
          <span className="opacity-75">Inquiries: {inquiries.length}</span>
        </div>
      </div>

      {/* Main Sandbox Simulation Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <span className="bg-sky-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold font-display leading-tight text-slate-800">Ethiopia Property Hub</h1>
              <p className="text-xs text-slate-500 font-medium">Unified Real Estate Synchronization Ecosystem</p>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full text-xs font-semibold">
            {[
              { id: 'portal', label: 'Web Portal', icon: Globe },
              { id: 'android', label: 'Android App', icon: Smartphone },
              { id: 'telegram', label: 'Telegram Bot', icon: Bot },
              { id: 'broker', label: 'Broker Dashboard', icon: User },
              { id: 'admin', label: 'Super Admin', icon: Shield },
              { id: 'api', label: 'REST Docs', icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white text-sky-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Simulated Application Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {activeTab === 'portal' && (
              <WebPortal
                properties={properties}
                brokers={brokers}
                agents={agents}
                onAddInquiry={handleAddInquiry}
                onAddAppointment={handleAddAppointment}
                onSubmitProperty={handleAddProperty}
                currentUserRole="Buyer"
              />
            )}

            {activeTab === 'android' && (
              <AndroidApp
                properties={properties}
              />
            )}

            {activeTab === 'telegram' && (
              <TelegramBot
                properties={properties}
                brokers={brokers}
                onAddProperty={handleAddProperty}
              />
            )}

            {activeTab === 'broker' && (
              <BrokerDashboard
                properties={properties}
                brokers={brokers}
                agents={agents}
                inquiries={inquiries}
                appointments={appointments}
                chatMessages={chatMessages}
                onAddProperty={handleAddProperty}
                onUpdatePropertyStatus={handleUpdatePropertyStatus}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onUpdateInquiryStatus={handleUpdateInquiryStatus}
                onSendChatMessage={handleSendChatMessage}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                properties={properties}
                brokers={brokers}
                agents={agents}
                subscriptions={subscriptions}
                logs={logs}
                appSettings={appSettings}
                onUpdatePropertyStatus={handleUpdatePropertyStatus}
                onUpdatePropertyPremium={handleUpdatePropertyPremium}
                onUpdateBrokerStatus={handleUpdateBrokerStatus}
                onDeleteProperty={handleDeleteProperty}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'api' && (
              <ApiDocs />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Ethiopia Property Hub. Built with full-stack Node + Express & React.</p>
          <div className="flex gap-4 font-semibold text-slate-500">
            <span>Unified Broker Licenses</span>
            <span>•</span>
            <span>Real-time Sync Webhooks</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
