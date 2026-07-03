/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, CheckCircle, Trash2, Award, BarChart3, Settings, Database, RefreshCw, Smartphone, Bot, Play, Pause, AlertTriangle, FileText, Check, ShieldCheck, Sparkles, Lock, Bell, CreditCard, Eye, AlertCircle, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Property, BrokerProfile, AgentProfile, UserSubscription, AuditLog, AppSettings, Transaction, PasswordResetRequest } from '../types';

interface AdminDashboardProps {
  properties: Property[];
  brokers: BrokerProfile[];
  agents: AgentProfile[];
  subscriptions: UserSubscription[];
  logs: AuditLog[];
  appSettings: AppSettings;
  transactions: Transaction[];
  adminProfile: any;
  resetRequests?: PasswordResetRequest[];
  onRefresh?: () => void;
  onUpdatePropertyStatus: (id: string, status: any) => void;
  onUpdatePropertyPremium: (id: string, field: 'isPremium' | 'isFeatured', val: boolean) => void;
  onUpdateBrokerStatus: (id: string, status: any) => void;
  onDeleteBroker: (id: string) => void;
  onDeleteProperty: (id: string) => void;
  onUpdateSettings: (settings: any) => void;
  onUpdateTransactionStatus: (id: string, status: any) => void;
  onUpdateAdminProfile: (updatedProfile: any) => void;
}

export default function AdminDashboard({
  properties,
  brokers,
  agents,
  subscriptions,
  logs,
  appSettings,
  transactions = [],
  adminProfile,
  resetRequests = [],
  onRefresh,
  onUpdatePropertyStatus,
  onUpdatePropertyPremium,
  onUpdateBrokerStatus,
  onDeleteBroker,
  onDeleteProperty,
  onUpdateSettings,
  onUpdateTransactionStatus,
  onUpdateAdminProfile,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'verify' | 'brokers' | 'analytics' | 'payments' | 'settings' | 'logs' | 'accountSettings'>('verify');
  const [checkingFraudId, setCheckingFraudId] = useState<string | null>(null);
  const [fraudResult, setFraudResult] = useState<any>(null);

  // Password reset request administration states
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});

  // Admin Account Settings state
  const [admName, setAdmName] = useState('');
  const [admUsername, setAdmUsername] = useState('admin');
  const [admEmail, setAdmEmail] = useState('admin@ethiopiapropertyhub.com');
  const [isEditUsername, setIsEditUsername] = useState(false);
  const [isEditEmail, setIsEditEmail] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const [admLogo, setAdmLogo] = useState('');
  const [admBio, setAdmBio] = useState('');
  const [admPassword, setAdmPassword] = useState('');
  const [admNotifications, setAdmNotifications] = useState(true);
  const [admTheme, setAdmTheme] = useState('light');

  React.useEffect(() => {
    if (adminProfile) {
      setAdmName(adminProfile.name || 'Central Admin');
      setAdmUsername(adminProfile.username || 'admin');
      setAdmEmail(adminProfile.email || 'admin@ethiopiapropertyhub.com');
      setAdmLogo(adminProfile.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80');
      setAdmBio(adminProfile.bio || 'Core System Overseer');
      setAdmPassword(adminProfile.password || 'admin123');
      setAdmNotifications(adminProfile.notificationsActive ?? true);
      setAdmTheme(adminProfile.theme || 'light');
    }
  }, [adminProfile]);

  // Compute stats
  const totalListings = properties.length;
  const pendingReviews = properties.filter(p => p.status === 'pending_review').length;
  const totalRevenue = subscriptions.reduce((sum, s) => sum + s.price, 0) + (properties.filter(p => p.isPremium).length * 4500);
  const approvedBrokers = brokers.filter(b => b.status === 'approved').length;

  // Recharts Chart Data Formatting
  const cityListingData = [
    { name: 'Bole', count: properties.filter(p => p.subCity === 'Bole').length },
    { name: 'Kazanchis', count: properties.filter(p => p.subCity === 'Kirkos').length },
    { name: 'CMC/Yeka', count: properties.filter(p => p.subCity === 'Yeka').length },
    { name: 'Mercato', count: properties.filter(p => p.subCity === 'Addis Ketema').length },
    { name: 'Kality', count: properties.filter(p => p.subCity === 'Akaki-Kality').length },
  ];

  const revenueTimelineData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 24000 },
    { month: 'Mar', revenue: 19000 },
    { month: 'Apr', revenue: 35000 },
    { month: 'May', revenue: 45000 },
    { month: 'Jun', revenue: totalRevenue },
  ];

  const categoryShareData = [
    { name: 'Residential', value: properties.filter(p => p.category === 'Residential').length },
    { name: 'Commercial', value: properties.filter(p => p.category === 'Commercial').length },
    { name: 'Land', value: properties.filter(p => p.category === 'Land').length },
    { name: 'Special', value: properties.filter(p => p.category === 'Special').length },
  ];
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

  // AI Fraud check trigger
  const triggerAIFraudCheck = async (property: Property) => {
    setCheckingFraudId(property.id);
    setFraudResult(null);
    try {
      const response = await fetch('/api/ai/fraud-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: property.title,
          description: property.description,
          price: property.price,
          city: property.city,
          subCity: property.subCity,
        })
      });
      const data = await response.json();
      setFraudResult({
        propId: property.id,
        ...data
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingFraudId(null);
    }
  };

  return (
    <div id="admin-dashboard-section" className="space-y-6">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
        <div>
          <span className="bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-500/20 flex items-center gap-1 w-max">
            <Shield className="w-3 h-3" /> Core System Admin
          </span>
          <h1 className="text-2xl font-bold font-display mt-2">Ethiopia Property Hub Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Supervise unified broker licenses, real-time sync networks, and bot webhooks.</p>
        </div>

        <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
          <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400">Database Connected: Central SQL</span>
        </div>
      </div>

      {/* Stats KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Properties</p>
          <p className="text-2xl font-extrabold font-display text-slate-800 mt-1">{totalListings}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">↑ Synchronized across Bot & App</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</p>
          <p className="text-2xl font-extrabold font-display text-amber-500 mt-1">{pendingReviews}</p>
          <span className="text-[10px] text-slate-400">Owner submitted & Broker reviews</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Platform Revenue</p>
          <p className="text-2xl font-extrabold font-display text-slate-800 mt-1">ETB {totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-sky-500 font-semibold">Sub subscriptions + Premium fees</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Approved Brokers</p>
          <p className="text-2xl font-extrabold font-display text-slate-800 mt-1">{approvedBrokers}</p>
          <span className="text-[10px] text-slate-400">Total registers: {brokers.length}</span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px text-sm">
        {[
          { id: 'verify', label: 'Verify Listings', count: pendingReviews, icon: CheckCircle },
          { id: 'brokers', label: 'Brokers & Agents', icon: Users },
          { id: 'analytics', label: 'Analytics Reports', icon: BarChart3 },
          { id: 'payments', label: 'Payments Settlement', count: transactions.filter(t => t.status === 'pending_approval').length, icon: CreditCard },
          { id: 'settings', label: 'Bot & App Settings', icon: Settings },
          { id: 'accountSettings', label: 'Admin Account', icon: Shield },
          { id: 'logs', label: 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-sky-500 text-sky-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[400px]">
        {/* TAB: Verify Listings */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Review & Audit Property Listings</h3>
              <p className="text-xs text-slate-500">Run security checks or approve listings into the synchronized feed.</p>
            </div>

            {/* AI Fraud Result display if any */}
            {fraudResult && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> AI Copilot Duplicate & Fraud Audit Analysis
                  </span>
                  <button onClick={() => setFraudResult(null)} className="text-slate-400 text-xs hover:text-slate-600">✕ Dismiss</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fraud Score</span>
                    <span className="text-lg font-extrabold text-slate-800">{fraudResult.fraudScore}% Risk</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Price Anomaly</span>
                    <span className="text-lg font-extrabold text-amber-600">{fraudResult.priceAnomaly}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Level</span>
                    <span className="text-lg font-extrabold text-amber-700">{fraudResult.riskLevel}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Duplication Found</span>
                    <span className="text-lg font-extrabold text-slate-800">{fraudResult.duplicationFound ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 pt-1 space-y-1">
                  <p className="font-bold">Findings details:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[11px]">
                    {fraudResult.reasons?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                  <p className="font-bold pt-1">Suggestions for action:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[11px]">
                    {fraudResult.suggestions?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                    <th className="p-3">Property</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Premium Tags</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">
                        <div>
                          <p>{p.title}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{p.type} • {p.category}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{p.subCity}, {p.city}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{p.currency} {p.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'pending_review' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 space-x-1.5">
                        <button
                          onClick={() => onUpdatePropertyPremium(p.id, 'isPremium', !p.isPremium)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            p.isPremium ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Premium
                        </button>
                        <button
                          onClick={() => onUpdatePropertyPremium(p.id, 'isFeatured', !p.isFeatured)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            p.isFeatured ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Featured
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {p.status === 'pending_review' && (
                          <button
                            onClick={() => onUpdatePropertyStatus(p.id, 'active')}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded text-[10px]"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => triggerAIFraudCheck(p)}
                          disabled={checkingFraudId === p.id}
                          className="px-2 py-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white font-medium rounded text-[10px] inline-flex items-center gap-1"
                        >
                          {checkingFraudId === p.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          AI Check
                        </button>
                        <button
                          onClick={() => onDeleteProperty(p.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Brokers & Agents */}
        {activeTab === 'brokers' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800">Approve Registered Real Estate Brokers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brokers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brokers ({brokers.length})</h4>
                <div className="space-y-3">
                  {brokers.map((b) => (
                    <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <img src={b.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{b.companyName}</p>
                          <p className="text-[10px] text-slate-500">License: {b.licenseNumber} • Rating: {b.rating}</p>
                        </div>
                      </div>
                      <div>
                        {b.status === 'pending' ? (
                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => onUpdateBrokerStatus(b.id, 'approved')}
                              className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-bold rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to completely remove broker "${b.companyName}" and delete all their listings?`)) {
                                  onDeleteBroker(b.id);
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Delete Broker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : b.status === 'frozen' ? (
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200">
                              Frozen
                            </span>
                            <button
                              onClick={() => onUpdateBrokerStatus(b.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded"
                            >
                              Unfreeze
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to completely remove broker "${b.companyName}" and delete all their listings?`)) {
                                  onDeleteBroker(b.id);
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Delete Broker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5" /> Approved
                            </span>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to FREEZE broker "${b.companyName}"? they won't be able to log in or manage listings.`)) {
                                  onUpdateBrokerStatus(b.id, 'frozen');
                                }
                              }}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded"
                            >
                              Freeze
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to completely remove broker "${b.companyName}" and delete all their listings?`)) {
                                  onDeleteBroker(b.id);
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                              title="Delete Broker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agents list info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agents Directory ({agents.length})</h4>
                <div className="space-y-3">
                  {agents.map((a) => {
                    const agency = brokers.find(b => b.id === a.brokerId)?.companyName || 'Unknown Agency';
                    return (
                      <div key={a.id} className="p-3 bg-white rounded-xl border border-slate-100 flex gap-3 items-center">
                        <img src={a.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{a.name}</p>
                          <p className="text-[10px] text-slate-500">Agency: {agency}</p>
                          <p className="text-[10px] text-sky-600 font-mono">{a.phone}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Platform Analytics Reports</h3>
              <button 
                onClick={() => alert("Report generated successfully! Export as CSV/PDF is fully configured in the production portal.")}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Export Monthly PDF Report
              </button>
            </div>

            {/* Charts grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chart 1 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Revenue Timeline (ETB)</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="#e0effe" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Regional Listing Volume (Addis)</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityListingData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Property Categories Share</h4>
                <div className="h-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legends */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 font-semibold pt-2 border-t">
                  {categoryShareData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-base font-bold text-slate-800">Telegram Bot & Android Push Settings</h3>

            <div className="space-y-4">
              {/* Telegram Bot Setting */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">EthiopiaPropertyHub_Bot Server</p>
                    <p className="text-[10px] text-slate-500">Active commands webhook, inline property catalogs uploads.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onUpdateSettings({ telegramBotActive: !appSettings.telegramBotActive });
                  }}
                  className={`px-3 py-1.5 font-bold rounded-lg text-xs flex items-center gap-1 transition-all ${
                    appSettings.telegramBotActive 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {appSettings.telegramBotActive ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
                  {appSettings.telegramBotActive ? 'Running' : 'Paused'}
                </button>
              </div>

              {/* Android app Maintenance */}
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div className="p-2.5 bg-sky-100 text-sky-600 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Android Maintenance Mode</p>
                    <p className="text-[10px] text-slate-500">Restricts public uploads and shows a clean upgrade dialog.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    {appSettings.androidMaintenanceMode ? 'On' : 'Off'}
                  </span>
                  <button
                    onClick={() => {
                      onUpdateSettings({ androidMaintenanceMode: !appSettings.androidMaintenanceMode });
                    }}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                      appSettings.androidMaintenanceMode ? 'bg-sky-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      appSettings.androidMaintenanceMode ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Centralized Database Audit Logs</h3>
              <p className="text-[10px] text-slate-400">Total recorded: {logs.length}</p>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-2.5 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start border-b border-slate-800 pb-2">
                  <span className="text-sky-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-400">{log.action}</span>
                  <span className="flex-1">{log.details}</span>
                  <span className="text-slate-500 text-[10px]">Actor: {log.user}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: payments */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-base font-bold text-slate-800">Platform Payments & Bank Settlements</h3>
              <p className="text-xs text-slate-500 mt-1">Audit transaction IDs, references, and receipts uploaded by property seekers seeking to close deals.</p>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-2xl bg-slate-50 text-slate-400">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-55" />
                  <p className="text-sm">No payment transaction records submitted to the platform yet.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.status === 'pending_approval' ? 'Pending Approval' : tx.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">ID: {tx.id}</span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm">{tx.propertyTitle}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-500">
                        <p><span className="font-semibold text-slate-700">Buyer:</span> {tx.buyerName}</p>
                        <p><span className="font-semibold text-slate-700">Phone:</span> {tx.buyerPhone}</p>
                        <p><span className="font-semibold text-slate-700">Email:</span> {tx.buyerEmail}</p>
                        <p><span className="font-semibold text-slate-700">Amount:</span> <span className="font-mono font-bold text-slate-800">{tx.currency} {tx.price.toLocaleString()}</span></p>
                        <p><span className="font-semibold text-slate-700">Gateway:</span> {tx.paymentGateway}</p>
                        <p><span className="font-semibold text-slate-700">Tx ID:</span> <span className="font-mono font-bold text-sky-600">{tx.transactionId}</span></p>
                      </div>

                      {tx.receiptUrl && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" /> Payment Attachment Receipt:</p>
                          <a href={tx.receiptUrl} target="_blank" rel="noreferrer">
                            <img src={tx.receiptUrl} alt="Transaction Attachment" className="w-24 h-24 object-cover rounded-lg border hover:opacity-90 transition-all cursor-pointer shadow-sm" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col justify-end items-end gap-2">
                      {tx.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => {
                              if(confirm(`Are you sure you want to APPROVED this payment of ${tx.currency} ${tx.price.toLocaleString()}?`)) {
                                onUpdateTransactionStatus(tx.id, 'approved');
                              }
                            }}
                            className="w-full md:w-max px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve Settlement
                          </button>
                          <button
                            onClick={() => {
                              if(confirm("Decline this payment receipt?")) {
                                onUpdateTransactionStatus(tx.id, 'declined');
                              }
                            }}
                            className="w-full md:w-max px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-red-200"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Decline Receipt
                          </button>
                        </>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono">Uploaded: {new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: accountSettings */}
        {activeTab === 'accountSettings' && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-base font-bold text-slate-800">Admin Profile Settings</h3>
              <p className="text-xs text-slate-500 mt-1">Configure your master system credentials, profile photo, and notification alerts.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateAdminProfile({
                name: admName,
                username: admUsername,
                email: admEmail,
                profilePic: admLogo,
                bio: admBio,
                password: admPassword,
                notificationsActive: admNotifications,
                theme: admTheme
              });
              alert("Admin settings updated successfully!");
              setIsEditUsername(false);
              setIsEditEmail(false);
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              setPassSuccess('');
              setPassError('');
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Basic Info */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Profile</h4>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Admin Display Name</label>
                  <input
                    type="text"
                    value={admName}
                    onChange={(e) => setAdmName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Avatar / Profile Picture URL</label>
                  <input
                    type="url"
                    value={admLogo}
                    onChange={(e) => setAdmLogo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                {/* Username with Edit symbol in front */}
                <div>
                  <label className="block font-bold text-slate-600 mb-1">User name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={admUsername}
                      onChange={(e) => setAdmUsername(e.target.value)}
                      disabled={!isEditUsername}
                      className={`w-full p-2.5 rounded-xl border transition-all ${isEditUsername ? 'border-sky-500 bg-white ring-1 ring-sky-500/20' : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditUsername(!isEditUsername)}
                      className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${isEditUsername ? 'bg-sky-500 text-white border-sky-600 shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}
                      title={isEditUsername ? 'Save / Lock field' : 'Edit Username'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isEditUsername ? 'Lock' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Email with Edit symbol in front */}
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={admEmail}
                      onChange={(e) => setAdmEmail(e.target.value)}
                      disabled={!isEditEmail}
                      className={`w-full p-2.5 rounded-xl border transition-all ${isEditEmail ? 'border-sky-500 bg-white ring-1 ring-sky-500/20' : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditEmail(!isEditEmail)}
                      className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${isEditEmail ? 'bg-sky-500 text-white border-sky-600 shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}
                      title={isEditEmail ? 'Save / Lock field' : 'Edit Email'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isEditEmail ? 'Lock' : 'Edit'}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-600 mb-1">Admin Slogan / Role Bio</label>
                  <textarea
                    value={admBio}
                    onChange={(e) => setAdmBio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    rows={2}
                    placeholder="Core system overseer and administrator"
                  />
                </div>

                {/* Change Password Section */}
                <div className="md:col-span-2 pt-4 border-t mt-2 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-500" /> Change Password Section
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Old Password</label>
                      <input
                        type="password"
                        placeholder="Current admin password"
                        value={oldPassword}
                        onChange={(e) => {
                          setOldPassword(e.target.value);
                          setPassError('');
                          setPassSuccess('');
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPassError('');
                          setPassSuccess('');
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setPassError('');
                          setPassSuccess('');
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  {passError && (
                    <div className="bg-red-50 text-red-700 text-[11px] p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}

                  {passSuccess && (
                    <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-medium">
                      <CheckSquare className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!oldPassword) {
                        setPassError('Please enter your current (old) password.');
                        return;
                      }
                      if (oldPassword !== admPassword) {
                        setPassError('Incorrect old password.');
                        return;
                      }
                      if (!newPassword) {
                        setPassError('Please enter a new password.');
                        return;
                      }
                      if (newPassword !== confirmNewPassword) {
                        setPassError('New passwords do not match.');
                        return;
                      }
                      
                      setAdmPassword(newPassword);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setPassSuccess('Password successfully queued! Submit form settings to fully save change.');
                    }}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Verify & Apply New Password
                  </button>
                </div>

                {/* Preference Options */}
                <div className="space-y-4 md:col-span-2 pt-4 border-t mt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferences</h4>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2 md:col-span-1">
                  <div className="flex gap-2 items-center">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">System Alerts & Logs</p>
                      <p className="text-[10px] text-slate-400">Receive system notification alerts</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={admNotifications}
                    onChange={(e) => setAdmNotifications(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2 md:col-span-1">
                  <div className="flex gap-2 items-center">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">Interface Default Theme</p>
                      <p className="text-[10px] text-slate-400">Configure global admin style</p>
                    </div>
                  </div>
                  <select
                    value={admTheme}
                    onChange={(e) => setAdmTheme(e.target.value)}
                    className="p-1 rounded bg-white text-xs border cursor-pointer"
                  >
                    <option value="light">Light Slate Theme</option>
                    <option value="dark">Cosmic Dark Theme</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Save Admin Profile Settings
                </button>
              </div>
            </form>

            {/* Password Reset Requests approvals */}
            <div className="pt-8 border-t mt-8">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <Lock className="w-4 h-4 text-sky-500" /> Pending Access & Password Reset Requests
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Review forgot password requests from brokers. You can directly approve and assign a new temporary password, approve the reset token, or decline the request.
              </p>

              {resetRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-slate-400 text-xs">
                  No pending password reset requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {resetRequests.filter(r => r.status === 'pending').map((req) => {
                    const tempPass = tempPasswords[req.id] || 'Ethiopia2026!';
                    const isSubmitting = submittingIds[req.id] || false;

                    const handleAction = async (status: 'approved' | 'declined', useTemp: boolean) => {
                      setSubmittingIds(prev => ({ ...prev, [req.id]: true }));
                      try {
                        const body: any = { status };
                        if (useTemp) {
                          body.temporaryPassword = tempPass;
                        }
                        const res = await fetch(`/api/auth/reset-requests/${req.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body)
                        });
                        if (res.ok) {
                          alert(useTemp ? `Password has been directly changed to: ${tempPass}` : "Request status has been updated successfully.");
                          if (onRefresh) onRefresh();
                        } else {
                          const data = await res.json();
                          alert(data.error || "Failed to update request.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Connection error.");
                      } finally {
                        setSubmittingIds(prev => ({ ...prev, [req.id]: false }));
                      }
                    };

                    return (
                      <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px] uppercase tracking-wider">{req.role} Request</span>
                            <span className="text-[10px] text-slate-400 font-mono">{new Date(req.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="font-bold text-slate-800">{req.email}</p>
                          <p className="text-[10px] text-slate-500">Token code: <strong className="font-mono text-sky-600">{req.token}</strong></p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {req.role === 'broker' && (
                            <div className="flex items-center gap-1.5 mr-2">
                              <input
                                type="text"
                                placeholder="Temporary password"
                                value={tempPass}
                                onChange={(e) => setTempPasswords(prev => ({ ...prev, [req.id]: e.target.value }))}
                                className="p-1.5 text-xs rounded border border-slate-200 bg-white w-32 font-mono text-slate-900"
                                disabled={isSubmitting}
                              />
                              <button
                                type="button"
                                onClick={() => handleAction('approved', true)}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition-all whitespace-nowrap cursor-pointer"
                              >
                                Approve & Set Password
                              </button>
                            </div>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => handleAction('approved', false)}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-[10px] shadow-sm transition-all whitespace-nowrap cursor-pointer"
                          >
                            Approve Link Token
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction('declined', false)}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition-all whitespace-nowrap cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
