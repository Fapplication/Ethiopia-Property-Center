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

import { Property, BrokerProfile, AgentProfile, Inquiry, Appointment, ChatMessage, UserSubscription, AuditLog, AppSettings, Transaction, PasswordResetRequest } from './types';

type RoleTab = 'portal' | 'android' | 'telegram' | 'broker' | 'admin' | 'api';

export default function App() {
  const [activeTab, setActiveTab] = useState<RoleTab>('portal');
  
  // User Authentication Context state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: 'admin' | 'broker';
    brokerId?: string;
    companyName?: string;
    email?: string;
  } | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState<'broker_login' | 'broker_register' | 'admin_login'>('broker_login');

  // Broker login states
  const [brokerEmail, setBrokerEmail] = useState('');
  const [brokerPassword, setBrokerPassword] = useState('');
  
  // Broker register states
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLogo, setRegLogo] = useState('');
  const [regWebsite, setRegWebsite] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Admin login states
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [loginError, setLoginError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Forgot password flow states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRole, setForgotRole] = useState<'admin' | 'broker'>('broker');
  const [showForgotSection, setShowForgotSection] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLinkToken, setForgotLinkToken] = useState('');

  // Reset page parameters (mock link loading)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetTokenParam, setResetTokenParam] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetNewPasswordConfirm, setResetNewPasswordConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  
  // Real synchronization database states
  const [properties, setProperties] = useState<Property[]>([]);
  const [brokers, setBrokers] = useState<BrokerProfile[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [adminProfile, setAdminProfile] = useState<any>(() => {
    const saved = localStorage.getItem('admin_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Core System Admin',
      email: 'admin@ethiopiapropertyhub.com',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
      password: 'admin',
      bio: 'Core system overseer and administrator',
      notificationsActive: true,
      theme: 'light'
    };
  });

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
        resTransactions,
        resResetRequests,
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
        fetch('/api/transactions').then(r => r.json()),
        fetch('/api/auth/reset-requests').then(r => r.json()),
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
      setTransactions(resTransactions || []);
      setResetRequests(resResetRequests || []);
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

  // Listen for resetToken query parameters on mount to trigger reset password dialog
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetTokenParam(token);
      setShowResetPasswordModal(true);
      // Clean up the URL query parameters so it doesn't pop up again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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

  // MUTATION: Delete Broker Account completely
  const handleDeleteBroker = async (id: string) => {
    try {
      const response = await fetch(`/api/brokers/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update transaction verification status
  const handleUpdateTransactionStatus = async (id: string, status: 'approved' | 'declined') => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
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

  // MUTATION: Update Broker Profile setting fields
  const handleUpdateBrokerProfile = async (id: string, updatedFields: any) => {
    try {
      const response = await fetch(`/api/brokers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (response.ok) {
        setSyncCount(prev => prev + 1);
        if (currentUser && currentUser.brokerId === id) {
          setCurrentUser(prev => prev ? {
            ...prev,
            companyName: updatedFields.companyName || prev.companyName,
            email: updatedFields.email || prev.email
          } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MUTATION: Update Admin Profile settings fields
  const handleUpdateAdminProfile = (updatedFields: any) => {
    setAdminProfile(updatedFields);
    localStorage.setItem('admin_profile', JSON.stringify(updatedFields));
  };

  const handleBrokerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!brokerEmail.trim() || !brokerPassword.trim()) {
      setLoginError('Please enter your email and password.');
      return;
    }
    const foundBroker = brokers.find(b => b.email.toLowerCase() === brokerEmail.trim().toLowerCase());
    if (!foundBroker) {
      setLoginError('No broker account found with this email. Please register first.');
      return;
    }
    const expectedPassword = foundBroker.password || 'password';
    if (brokerPassword.trim() !== expectedPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }
    if (foundBroker.status === 'frozen') {
      setLoginError('Your broker account has been frozen due to agreement violations. Please contact the administrator.');
      return;
    }
    if (foundBroker.status === 'pending') {
      setLoginError('Broker authorization pending. Please contact system Admin for approval.');
      return;
    }
    setCurrentUser({
      id: foundBroker.id,
      role: 'broker',
      brokerId: foundBroker.id,
      companyName: foundBroker.companyName,
      email: foundBroker.email,
    });
    setActiveTab('broker');
    setShowLoginModal(false);
    setBrokerEmail('');
    setBrokerPassword('');
  };
 
  const handleBrokerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setRegisterSuccess('');
    if (!regCompanyName || !regEmail || !regLicense || !regPassword) {
      setLoginError('Please fill in Company Name, Email, License Number, and a secure Password.');
      return;
    }
    const newBroker = {
      companyName: regCompanyName,
      licenseNumber: regLicense,
      phone: regPhone,
      email: regEmail,
      address: regAddress,
      logo: regLogo || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&q=80',
      website: regWebsite,
      password: regPassword,
      status: 'pending',
    };
    try {
      const response = await fetch('/api/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBroker),
      });
      if (response.ok) {
        setRegisterSuccess('Registration request submitted! You will be able to log in once authorized by the admin.');
        setRegCompanyName('');
        setRegLicense('');
        setRegPhone('');
        setRegEmail('');
        setRegAddress('');
        setRegLogo('');
        setRegWebsite('');
        setRegPassword('');
        setSyncCount(prev => prev + 1);
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Registration failed. Try again.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Server connection error. Registration failed.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (adminUser.trim().toLowerCase() === 'admin' && adminPass.trim() === adminProfile.password) {
      setCurrentUser({
        id: 'admin',
        role: 'admin',
      });
      setActiveTab('admin');
      setShowLoginModal(false);
      setAdminUser('');
      setAdminPass('');
    } else {
      setLoginError('Invalid Administrator credentials.');
    }
  };

  const handleTriggerForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLinkToken('');
    
    if (!forgotEmail) {
      setForgotError('Please enter your pre-registered email address.');
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, role: forgotRole }),
      });

      const data = await response.json();
      if (response.ok) {
        setForgotSuccess(data.message);
        if (data.token) {
          setForgotLinkToken(data.token);
        }
        setSyncCount(prev => prev + 1);
      } else {
        setForgotError(data.error || 'Failed to request password reset.');
      }
    } catch (err) {
      console.error(err);
      setForgotError('Connection error. Failed to send request.');
    }
  };

  const handleCompleteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetNewPassword || !resetNewPasswordConfirm) {
      setResetError('Please fill in both fields.');
      return;
    }

    if (resetNewPassword !== resetNewPasswordConfirm) {
      setResetError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetTokenParam, newPassword: resetNewPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setResetSuccess('Your password has been changed successfully!');
        
        // If it was the admin resetting their password, update the admin profile in local storage & state!
        if (data.role === 'admin') {
          const updatedProfile = { ...adminProfile, password: resetNewPassword };
          setAdminProfile(updatedProfile);
          localStorage.setItem('admin_profile', JSON.stringify(updatedProfile));
        }

        setTimeout(() => {
          setShowResetPasswordModal(false);
          setResetNewPassword('');
          setResetNewPasswordConfirm('');
          setResetTokenParam('');
          setResetSuccess('');
          setShowLoginModal(true);
        }, 2000);
        setSyncCount(prev => prev + 1);
      } else {
        setResetError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setResetError('Connection error. Failed to reset password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('portal');
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <span className="bg-sky-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold font-display leading-tight text-slate-800">Ethiopia Property Hub</h1>
              <p className="text-xs text-slate-500 font-medium">Unified Real Estate Synchronization Ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto justify-end">
            {/* Interactive Role Switcher - ONLY shown for Admin */}
            {currentUser?.role === 'admin' && (
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full text-xs font-semibold">
                {[
                  { id: 'portal', label: 'Web Portal', icon: Globe },
                  { id: 'android', label: 'Android App', icon: Smartphone },
                  { id: 'telegram', label: 'Telegram Bot', icon: Bot },
                  { id: 'broker', label: 'Broker Dashboard', icon: User },
                  { id: 'admin', label: 'Admin', icon: Shield },
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
            )}

            {/* Profile & Auth Info */}
            {currentUser ? (
              <div className="flex items-center gap-2 text-xs bg-slate-50 p-1 rounded-xl border border-slate-100 pl-3">
                <div className="text-right mr-1.5">
                  <p className="font-bold text-slate-800 max-w-[150px] truncate">
                    {currentUser.role === 'admin' ? 'System Admin' : currentUser.companyName}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    Authorized {currentUser.role} Account
                  </p>
                </div>
                
                {currentUser.role === 'broker' && (
                  <button
                    onClick={() => setActiveTab(activeTab === 'broker' ? 'portal' : 'broker')}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-all shadow-sm"
                  >
                    {activeTab === 'broker' ? 'View Public Portal' : 'My Dashboard'}
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-bold transition-all"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginError('');
                  setRegisterSuccess('');
                  setShowLoginModal(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Sign In / Register Broker
              </button>
            )}
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
                transactions={transactions}
                onAddProperty={handleAddProperty}
                onUpdatePropertyStatus={handleUpdatePropertyStatus}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onUpdateInquiryStatus={handleUpdateInquiryStatus}
                onSendChatMessage={handleSendChatMessage}
                onUpdateTransactionStatus={handleUpdateTransactionStatus}
                onUpdateBrokerProfile={handleUpdateBrokerProfile}
                currentBrokerId={currentUser?.role === 'broker' ? currentUser.brokerId : 'broker-1'}
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
                transactions={transactions}
                adminProfile={adminProfile}
                resetRequests={resetRequests}
                onRefresh={() => setSyncCount(prev => prev + 1)}
                onUpdatePropertyStatus={handleUpdatePropertyStatus}
                onUpdatePropertyPremium={handleUpdatePropertyPremium}
                onUpdateBrokerStatus={handleUpdateBrokerStatus}
                onDeleteBroker={handleDeleteBroker}
                onDeleteProperty={handleDeleteProperty}
                onUpdateSettings={handleUpdateSettings}
                onUpdateTransactionStatus={handleUpdateTransactionStatus}
                onUpdateAdminProfile={handleUpdateAdminProfile}
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

      {/* Dynamic Authorization Portal Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full relative"
            >
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                  setRegisterSuccess('');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold font-display text-slate-900 text-center mb-1">
                {showForgotSection ? "Access Recovery Portal" : "Ecosystem Control Access"}
              </h2>
              <p className="text-xs text-slate-500 text-center mb-6">
                {showForgotSection ? "Regain access to your Hub account" : "Authenticate your real estate credentials or register your licensing"}
              </p>

              {showForgotSection ? (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Enter your pre-registered email address. We will generate a password-changing link. For brokers, the Administrator can also approve your reset directly from the control dashboard.
                  </p>

                  {forgotError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{forgotSuccess}</span>
                    </div>
                  )}

                  {forgotLinkToken && (
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 space-y-2">
                      <p className="font-bold text-sky-800 flex items-center gap-1.5 text-[11px]">
                        ✉️ Pre-Registered Email Inbox Simulator
                      </p>
                      <p className="text-slate-600 text-[10px] leading-relaxed">
                        Since this is a preview, we've caught the reset email in real time! Click the button below to simulate arriving from the email link:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setResetTokenParam(forgotLinkToken);
                          setShowResetPasswordModal(true);
                          setShowLoginModal(false);
                          setShowForgotSection(false);
                          setForgotLinkToken('');
                        }}
                        className="inline-block px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-center rounded-lg text-[11px] transition-all"
                      >
                        Simulate Clicking Reset Link
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleTriggerForgotPassword} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Pre-Registered Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g., info@habeshaelite.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full p-2.5 rounded-lg border text-xs"
                        required
                        disabled={!!forgotLinkToken}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Account Role Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForgotRole('broker')}
                          className={`py-2 rounded-lg border text-center font-semibold transition-all ${forgotRole === 'broker' ? 'bg-sky-50 border-sky-300 text-sky-600' : 'bg-white border-slate-200 text-slate-500'}`}
                          disabled={!!forgotLinkToken}
                        >
                          Broker Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setForgotRole('admin')}
                          className={`py-2 rounded-lg border text-center font-semibold transition-all ${forgotRole === 'admin' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                          disabled={!!forgotLinkToken}
                        >
                          Administrator
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                      disabled={!!forgotLinkToken}
                    >
                      Generate Changing Link
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotSection(false);
                      setForgotError('');
                      setForgotSuccess('');
                      setForgotLinkToken('');
                    }}
                    className="w-full py-2 text-center text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                  >
                    ← Back to Control Access login
                  </button>
                </div>
              ) : (
                <>
                  {/* Login Tabs Selector */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-center mb-5">
                    <button
                      type="button"
                      onClick={() => { setLoginTab('broker_login'); setLoginError(''); setRegisterSuccess(''); }}
                      className={`py-2 rounded-lg transition-all ${loginTab === 'broker_login' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Broker Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginTab('broker_register'); setLoginError(''); setRegisterSuccess(''); }}
                      className={`py-2 rounded-lg transition-all ${loginTab === 'broker_register' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Broker Register
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginTab('admin_login'); setLoginError(''); setRegisterSuccess(''); }}
                      className={`py-2 rounded-lg transition-all ${loginTab === 'admin_login' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Admin Login
                    </button>
                  </div>

                  {loginError && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 mb-4 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {registerSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-100 mb-4 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  {/* TAB 1: Broker Login */}
                  {loginTab === 'broker_login' && (
                    <form onSubmit={handleBrokerLogin} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Broker Profile Email</label>
                        <input
                          type="email"
                          placeholder="e.g., info@habeshaelite.com"
                          value={brokerEmail}
                          onChange={(e) => setBrokerEmail(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Password</label>
                        <input
                          type="password"
                          placeholder="Enter broker password"
                          value={brokerPassword}
                          onChange={(e) => setBrokerPassword(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                          required
                        />
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[10px] text-slate-400">
                            Please use your registered broker credentials.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgotSection(true);
                              setForgotRole('broker');
                              setForgotEmail(brokerEmail);
                            }}
                            className="text-[10px] text-sky-500 hover:text-sky-700 font-bold underline cursor-pointer bg-transparent border-none p-0"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                      >
                        Authenticate & Enter Dashboard
                      </button>
                    </form>
                  )}

                  {/* TAB 2: Broker Registration */}
                  {loginTab === 'broker_register' && (
                    <form onSubmit={handleBrokerRegister} className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Company Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Afro-Century Realty"
                          value={regCompanyName}
                          onChange={(e) => setRegCompanyName(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">License Number *</label>
                          <input
                            type="text"
                            placeholder="e.g., RE-2026-99"
                            value={regLicense}
                            onChange={(e) => setRegLicense(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Email *</label>
                          <input
                            type="email"
                            placeholder="e.g., info@afrocentury.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-xs"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Phone</label>
                          <input
                            type="tel"
                            placeholder="e.g., +251 911 223 344"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Website URL</label>
                          <input
                            type="url"
                            placeholder="e.g., https://afrocentury.com"
                            value={regWebsite}
                            onChange={(e) => setRegWebsite(e.target.value)}
                            className="w-full p-2.5 rounded-lg border text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Office Address</label>
                        <input
                          type="text"
                          placeholder="e.g., Bole, Century Mall, 4th Floor"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Logo Image URL (Optional)</label>
                        <input
                          type="url"
                          placeholder="e.g., https://images.unsplash.com/..."
                          value={regLogo}
                          onChange={(e) => setRegLogo(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Secure Password *</label>
                        <input
                          type="password"
                          placeholder="Choose a password for login"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all mt-4"
                      >
                        Submit Registration Request
                      </button>
                    </form>
                  )}

                  {/* TAB 3: Admin Login */}
                  {loginTab === 'admin_login' && (
                    <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Admin Username</label>
                        <input
                          type="text"
                          placeholder="Enter administrator username"
                          value={adminUser}
                          onChange={(e) => setAdminUser(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Password</label>
                        <input
                          type="password"
                          placeholder="Enter administrator password"
                          value={adminPass}
                          onChange={(e) => setAdminPass(e.target.value)}
                          className="w-full p-2.5 rounded-lg border text-xs"
                          required
                        />
                        <div className="flex justify-between items-center mt-1.5">
                          <span />
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgotSection(true);
                              setForgotRole('admin');
                              setForgotEmail('admin@ethiopiapropertyhub.com');
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer bg-transparent border-none p-0"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                      >
                        Login to Control Center
                      </button>
                    </form>
                  )}
                </>
              )}

              <div className="mt-5 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
                Authorized access only. Registered entities must comply with federal license terms.
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPasswordModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full relative text-xs"
            >
              <h2 className="text-xl font-bold font-display text-slate-900 text-center mb-1">Change Your Password</h2>
              <p className="text-xs text-slate-500 text-center mb-6">
                Fill in your new secure password to finalize the reset handshake.
              </p>

              {resetError && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 mb-4 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-100 mb-4 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCompleteResetPassword} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-xs text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={resetNewPasswordConfirm}
                    onChange={(e) => setResetNewPasswordConfirm(e.target.value)}
                    className="w-full p-2.5 rounded-lg border text-xs text-slate-900"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all mt-2 cursor-pointer"
                >
                  Save New Password
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResetTokenParam('');
                }}
                className="w-full mt-4 py-2 text-center text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
