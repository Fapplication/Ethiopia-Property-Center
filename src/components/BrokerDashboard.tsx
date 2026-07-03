/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Mail, Calendar, MessageSquare, Plus, Check, X, Phone, User, Landmark, ShieldCheck, Star, Send, MapPin } from 'lucide-react';
import { Property, BrokerProfile, AgentProfile, Inquiry, Appointment, ChatMessage } from '../types';

interface BrokerDashboardProps {
  properties: Property[];
  brokers: BrokerProfile[];
  agents: AgentProfile[];
  inquiries: Inquiry[];
  appointments: Appointment[];
  chatMessages: ChatMessage[];
  onAddProperty: (prop: any) => void;
  onUpdatePropertyStatus: (id: string, status: any) => void;
  onUpdateAppointmentStatus: (id: string, status: any) => void;
  onUpdateInquiryStatus: (id: string, status: any) => void;
  onSendChatMessage: (msg: any) => void;
}

export default function BrokerDashboard({
  properties,
  brokers,
  agents,
  inquiries,
  appointments,
  chatMessages,
  onAddProperty,
  onUpdatePropertyStatus,
  onUpdateAppointmentStatus,
  onUpdateInquiryStatus,
  onSendChatMessage,
}: BrokerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'leads' | 'tours' | 'chat'>('inventory');
  const [showAddForm, setShowAddForm] = useState(false);
  const [chatChannel, setChatChannel] = useState('chat_broker-1_buyer');
  const [typedMessage, setTypedMessage] = useState('');

  // Local Broker profile mock login (Habesha Elite Realty)
  const currentBrokerId = 'broker-1';
  const myBrokerProfile = brokers.find(b => b.id === currentBrokerId) || brokers[0];

  // Filter listings assigned to my agency
  const myProperties = properties.filter(p => p.brokerId === currentBrokerId || p.status === 'pending_review');
  const myInquiries = inquiries.filter(i => i.brokerId === currentBrokerId);
  const myAppointments = appointments.filter(a => a.brokerId === currentBrokerId);

  // New property form state
  const [newProp, setNewProp] = useState({
    title: '',
    description: '',
    price: 80000,
    currency: 'ETB' as 'ETB' | 'USD',
    type: 'Apartment' as any,
    category: 'Residential' as any,
    purpose: 'Rent' as any,
    bedrooms: 3,
    bathrooms: 2,
    garage: true,
    kitchen: true,
    livingRooms: 1,
    balcony: true,
    area: 160,
    floor: 4,
    buildingAge: 2,
    address: 'Bole, near Atlas',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    subCity: 'Bole',
    woreda: 'Woreda 04',
    water: true,
    electricity: true,
    internet: true,
    parking: true,
    security: true,
    furnished: true,
    swimmingPool: false,
    garden: false,
    ownershipStatus: 'Clean Title' as any,
    propertyCondition: 'New' as any,
  });

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProp.title || !newProp.description) {
      alert("Please fill in basic fields.");
      return;
    }
    onAddProperty({
      ...newProp,
      status: 'active', // Direct broker upload bypasses reviews
      brokerId: currentBrokerId,
      agentId: 'agent-1',
      isPremium: false,
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80']
    });
    alert("New property successfully listed in the ecosystem database!");
    setShowAddForm(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    onSendChatMessage({
      channelId: chatChannel,
      senderId: 'agent-1', // Sent by broker agent Yonas Kebede
      senderName: 'Yonas Kebede',
      text: typedMessage,
    });
    setTypedMessage('');
  };

  const activeChatMessages = chatMessages.filter(m => m.channelId === chatChannel);

  return (
    <div id="broker-dashboard-section" className="space-y-6">
      {/* Welcome Banner */}
      {myBrokerProfile && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <img src={myBrokerProfile.logo} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-slate-900 font-display">{myBrokerProfile.companyName}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Certified Partner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{myBrokerProfile.address} • License: {myBrokerProfile.licenseNumber}</p>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> {myBrokerProfile.rating} ({myBrokerProfile.reviewsCount} verified reviews)
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Property Listing
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">My Inventory</p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{myProperties.length} Properties</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Unread Leads</p>
          <p className="text-xl font-extrabold text-amber-500 mt-1">{myInquiries.filter(i => i.status === 'new').length} Inquiries</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Active Tours</p>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{myAppointments.filter(a => a.status === 'approved').length} Booked</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-slate-200 text-sm">
        {[
          { id: 'inventory', label: 'Property Inventory', icon: Home },
          { id: 'leads', label: 'Customer Leads', icon: Mail },
          { id: 'tours', label: 'Tours Calendar', icon: Calendar },
          { id: 'chat', label: 'Live Chat Center', icon: MessageSquare },
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
            </button>
          );
        })}
      </div>

      {/* Form: Add Property */}
      {showAddForm && (
        <form onSubmit={handleCreateProperty} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-800 font-display">Upload New Property Spec</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="col-span-2">
              <label className="block font-bold text-slate-600 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g., Luxury 3-Bedroom Apartment in Bole"
                value={newProp.title}
                onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
                className="w-full p-2 rounded-lg border text-xs"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-slate-600 mb-1">Description</label>
              <textarea
                placeholder="Details about building age, amenities..."
                value={newProp.description}
                onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
                className="w-full p-2 rounded-lg border text-xs"
                rows={2}
                required
              ></textarea>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Price</label>
              <input
                type="number"
                value={newProp.price}
                onChange={(e) => setNewProp({ ...newProp, price: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Currency</label>
              <select
                value={newProp.currency}
                onChange={(e: any) => setNewProp({ ...newProp, currency: e.target.value })}
                className="w-full p-2 rounded-lg border text-xs bg-white"
              >
                <option value="ETB">ETB (Birr)</option>
                <option value="USD">USD (Dollars)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Type</label>
              <select
                value={newProp.type}
                onChange={(e: any) => setNewProp({ ...newProp, type: e.target.value })}
                className="w-full p-2 rounded-lg border text-xs bg-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
                <option value="Office">Office</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Purpose</label>
              <select
                value={newProp.purpose}
                onChange={(e: any) => setNewProp({ ...newProp, purpose: e.target.value })}
                className="w-full p-2 rounded-lg border text-xs bg-white"
              >
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
                <option value="Lease">Lease</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs text-slate-500 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs bg-sky-500 text-white rounded hover:bg-sky-600"
            >
              Save Listing
            </button>
          </div>
        </form>
      )}

      {/* Tabs Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* PANEL: Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">Assigned Properties Inventory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                    <th className="p-3">Title</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Listing Status</th>
                    <th className="p-3">Database Verification</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{p.title}</p>
                        <span className="text-[10px] text-slate-400">{p.type} • {p.subCity || 'Addis Ababa'}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">{p.currency} {p.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'sold' || p.status === 'rented' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.status === 'pending_review' ? (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">Owner submission pending approval</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-0.5 w-max">
                            <Check className="w-3 h-3" /> Fully Synced Live
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {p.status === 'pending_review' && (
                          <button
                            onClick={() => onUpdatePropertyStatus(p.id, 'active')}
                            className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded text-[10px]"
                          >
                            Approve & Publish
                          </button>
                        )}
                        {p.status === 'active' && (
                          <button
                            onClick={() => onUpdatePropertyStatus(p.id, p.purpose === 'Rent' ? 'rented' : 'sold')}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-[10px]"
                          >
                            Mark {p.purpose === 'Rent' ? 'Rented' : 'Sold'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: leads */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">Customer Leads & Inquiries</h3>
            <div className="space-y-3">
              {myInquiries.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 border border-dashed rounded-xl">No active leads listed for your properties yet.</p>
              ) : (
                myInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{inq.customerName}</p>
                        <p className="text-xs text-slate-400">Message medium: <span className="text-sky-600 font-bold">{inq.method}</span> • For Listing: <span className="font-semibold text-slate-600">{inq.propertyTitle}</span></p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inq.status === 'new' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 italic">
                      "{inq.message}"
                    </p>

                    <div className="flex justify-between items-center text-xs">
                      <div className="flex gap-4 text-slate-500">
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-sky-500" /> {inq.customerPhone}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {inq.status === 'new' && (
                          <button
                            onClick={() => onUpdateInquiryStatus(inq.id, 'responded')}
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold rounded-lg transition-all"
                          >
                            Mark Responded
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Reply Live
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PANEL: tours */}
        {activeTab === 'tours' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">Physical Viewing Appointments</h3>
            <div className="space-y-3">
              {myAppointments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 border border-dashed rounded-xl">No physical tours scheduled yet.</p>
              ) : (
                myAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Tour by {apt.customerName}</p>
                      <p className="text-xs text-slate-500">Property: <span className="font-semibold text-slate-600">{apt.propertyTitle}</span></p>
                      <p className="text-[11px] font-bold text-sky-600 font-mono mt-1">Scheduled for: {apt.date} at {apt.time}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        apt.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        apt.status === 'declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {apt.status}
                      </span>

                      {apt.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'approved')}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Approve Tour"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'declined')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Decline Tour"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PANEL: chat */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">Live Customer Chat Channels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border rounded-2xl h-96 overflow-hidden bg-slate-50">
              {/* Left sidebar: channels */}
              <div className="md:col-span-4 border-r bg-white flex flex-col">
                <p className="p-3 text-[10px] font-bold text-slate-400 uppercase border-b bg-slate-50">Active Customers</p>
                <button
                  onClick={() => setChatChannel('chat_broker-1_buyer')}
                  className={`p-3 text-left transition-colors border-b flex items-center gap-2.5 ${
                    chatChannel === 'chat_broker-1_buyer' ? 'bg-sky-50/70 border-r-4 border-r-sky-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs">Michael Demissie</p>
                    <p className="text-[10px] text-slate-400 truncate">Is the price open for negotiation?</p>
                  </div>
                </button>
              </div>

              {/* Right column: chat content */}
              <div className="md:col-span-8 flex flex-col h-full bg-slate-50">
                {/* Chat window Header */}
                <div className="bg-white p-3 border-b flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">Michael Demissie</p>
                    <span className="text-[10px] text-slate-400 font-medium">Bole Villa Inquiry • Live Sync Ready</span>
                  </div>
                </div>

                {/* Messages scrollarea */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {activeChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                        msg.senderId === 'agent-1' 
                          ? 'bg-sky-500 text-white ml-auto rounded-tr-none' 
                          : 'bg-white text-slate-800 mr-auto rounded-tl-none border border-slate-100'
                      }`}
                    >
                      <p className="font-bold text-[10px] opacity-75 mb-0.5">{msg.senderName}</p>
                      <p>{msg.text}</p>
                      
                      {/* Optional location rendering */}
                      {msg.location && (
                        <div className="mt-2 bg-black/10 p-2 rounded-lg flex items-center gap-1 text-[10px] font-mono">
                          <MapPin className="w-3.5 h-3.5" /> Coordinates Shared: {msg.location.lat}, {msg.location.lng}
                        </div>
                      )}
                      
                      <span className="text-[9px] opacity-50 block mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chat send footer */}
                <form onSubmit={handleSendChat} className="bg-white p-3 border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message to Michael..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 p-2 border rounded-xl text-xs"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
