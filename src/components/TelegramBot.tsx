/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, CheckCheck, RefreshCw, Globe, HelpCircle, Compass, FolderOpen, ArrowUpRight, Sparkles } from 'lucide-react';
import { Property, BrokerProfile } from '../types';

interface TelegramBotProps {
  properties: Property[];
  brokers: BrokerProfile[];
  onAddProperty: (prop: any) => void;
}

interface BotMsg {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  keyboard?: string[];
  propertyCard?: Property;
  brokerList?: BrokerProfile[];
}

export default function TelegramBot({ properties, brokers, onAddProperty }: TelegramBotProps) {
  const [typedCommand, setTypedCommand] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'EN' | 'AM'>('EN');

  const INITIAL_BOT_MESSAGES: BotMsg[] = [
    {
      id: 'bot-1',
      sender: 'bot',
      text: `🤖 *Ethiopia Property Hub Bot* 

Hello! Welcome to the decentralized real estate synchronization bot of Ethiopia.

Choose an option below to search villas, find certified brokers, change language, or instantly list your property. All data syncs in real-time with our Web Portal and Android App!`,
      timestamp: '10:13 AM',
      keyboard: ['Search Properties 🔍', 'Featured Listings ⭐', 'Broker Directory 📁', 'Add Property Spec ➕', 'Choose Language 🌐']
    }
  ];

  const [conversation, setConversation] = useState<BotMsg[]>(INITIAL_BOT_MESSAGES);

  // Amharic Translation Map
  const amharicTranslation: Record<string, string> = {
    welcome: `🤖 *የኢትዮጵያ ፕሮፐርቲ ሃብ ቦት*

ሰላም! እንኳን ወደ ኢትዮጵያ ፕሮፐርቲ ሃብ የቴሌግራም ቦት በደህና መጡ።

አፓርትመንት ለመፈለግ፣ የተመሰከረላቸው ደላላዎችን ለማግኘት ወይም የራስዎን ቤት ለመሸጥ/ለማከራየት ከታች ካሉት አማራጮች አንዱን ይምረጡ። ሁሉም መረጃዎች ከድረ-ገጻችን እና ከአንድሮይድ መተግበሪያችን ጋር በቀጥታ ይመሳሰላሉ!`,
    search_prompt: '🔍 በመረጡት ሰፈር ቤቶችን ይፈልጉ፡\nለምሳሌ፡ "Bole" ወይም "Kazanchis" ብለው ይጻፉ።',
    featured_prompt: '⭐ በልዩ ሁኔታ የቀረቡ ፕሪሚየም ቤቶች ዝርዝር፡',
    broker_prompt: '📁 የተመሰከረላቸው እና ፈቃድ ያላቸው የኢትዮጵያ ደላላ ድርጅቶች ዝርዝር፡',
    lang_prompt: '🌐 የቦቱን ቋንቋ ይቀይሩ / Select Bot Language:',
    add_prompt: '➕ የቴሌግራም መመዝገቢያ ፎርም፡ አዲስ ቤት በቀጥታ ወደ ሲስተሙ ለማስገባት ከታች ይጫኑ።'
  };

  // Bot response engine
  const triggerBotReply = (userText: string) => {
    const userMsg: BotMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let botReplyText = '';
    let botReplyKeyboard = ['Search Properties 🔍', 'Featured Listings ⭐', 'Broker Directory 📁', 'Add Property Spec ➕', 'Choose Language 🌐'];
    let matchedProp: Property | undefined = undefined;
    let showBrokers: BrokerProfile[] | undefined = undefined;

    const cleanText = userText.trim().toLowerCase();

    if (cleanText.includes('/start') || cleanText.includes('back to menu') || cleanText.includes('ለመመለስ')) {
      botReplyText = currentLanguage === 'AM' ? amharicTranslation.welcome : INITIAL_BOT_MESSAGES[0].text;
    } else if (cleanText.includes('search properties') || cleanText.includes('ፈልጉ') || cleanText.includes('🔍')) {
      botReplyText = currentLanguage === 'AM' ? amharicTranslation.search_prompt : `🔍 *Search Properties Catalog*
      
Please type the name of the neighborhood you are looking for (e.g. *Bole*, *Kazanchis*, *CMC*) to filter matches from our centralized database!`;
      botReplyKeyboard = ['Bole', 'Kazanchis', 'CMC', 'Bishoftu', 'Main Menu 🔙'];
    } else if (cleanText === 'bole') {
      matchedProp = properties.find(p => p.subCity === 'Bole' && p.status === 'active');
      botReplyText = matchedProp ? `Matched Listing Found in Bole! 👇` : `No active listings found in Bole right now.`;
    } else if (cleanText === 'kazanchis') {
      matchedProp = properties.find(p => p.subCity === 'Kirkos' && p.status === 'active');
      botReplyText = matchedProp ? `Matched Listing Found in Kazanchis! 👇` : `No active listings found in Kazanchis right now.`;
    } else if (cleanText === 'cmc') {
      matchedProp = properties.find(p => p.subCity === 'Yeka' && p.status === 'active');
      botReplyText = matchedProp ? `Matched Listing Found in CMC! 👇` : `No active listings found in CMC right now.`;
    } else if (cleanText === 'bishoftu') {
      matchedProp = properties.find(p => p.city === 'Bishoftu' && p.status === 'active');
      botReplyText = matchedProp ? `Matched Listing Found in Bishoftu! 👇` : `No active listings found in Bishoftu right now.`;
    } else if (cleanText.includes('featured') || cleanText.includes('⭐')) {
      botReplyText = currentLanguage === 'AM' ? amharicTranslation.featured_prompt : `⭐ *Featured Premium Listings*
      
Displaying active premium listings with top-tier verification tags. These properties appear first on the web portal and Android app.`;
      matchedProp = properties.find(p => p.isPremium && p.status === 'active');
    } else if (cleanText.includes('directory') || cleanText.includes('ደላላ') || cleanText.includes('📁')) {
      botReplyText = currentLanguage === 'AM' ? amharicTranslation.broker_prompt : `📁 *Verified Broker Directory*
      
Here are verified real estate agency profiles registered on our unified exchange network.`;
      showBrokers = brokers;
    } else if (cleanText.includes('language') || cleanText.includes('🌐')) {
      botReplyText = currentLanguage === 'AM' ? amharicTranslation.lang_prompt : `🌐 *Choose Bot Language / ቋንቋ ይምረጡ*
      
Click on your preferred language below:`;
      botReplyKeyboard = ['English 🇬🇧', 'አማርኛ 🇪🇹', 'Main Menu 🔙'];
    } else if (cleanText.includes('english')) {
      setCurrentLanguage('EN');
      botReplyText = `Language set to *English 🇬🇧*. Bot menus updated successfully.`;
    } else if (cleanText.includes('አማርኛ')) {
      setCurrentLanguage('AM');
      botReplyText = `ቋንቋዎ ወደ *አማርኛ 🇪🇹* በተሳካ ሁኔታ ተቀይሯል። የቦቱ ዝርዝሮች በአማርኛ ቀርበዋል።`;
      botReplyKeyboard = ['ቤቶች ፈልግ 🔍', 'ልዩ ቤቶች ⭐', 'ደላላዎች ማውጫ 📁', 'ቤት መዝግብ ➕', 'ቋንቋ ቀይር 🌐'];
    } else if (cleanText.includes('add property') || cleanText.includes('መዝግብ') || cleanText.includes('➕')) {
      botReplyText = currentLanguage === 'AM' ? amharicTranslation.add_prompt : `➕ *Direct Telegram Listing Registration*
      
You can submit a property directly from Telegram! Click the button below to pre-populate a verified mock studio apartment listing in Addis Ababa.`;
      botReplyKeyboard = ['Submit Studio Listing 🚀', 'Main Menu 🔙'];
    } else if (cleanText.includes('submit studio') || cleanText.includes('🚀')) {
      // Simulate quick listing submission
      const mockStudio = {
        title: 'Cozy G+0 Studio near Bole Airport',
        description: 'Compact self-contained modern studio apartment ideal for single professionals or transit flyers, listed via Telegram Bot.',
        price: 12000,
        currency: 'ETB',
        type: 'Studio',
        category: 'Residential',
        purpose: 'Rent',
        bedrooms: 1,
        bathrooms: 1,
        garage: false,
        kitchen: true,
        livingRooms: 1,
        balcony: false,
        area: 45,
        floor: 1,
        buildingAge: 1,
        address: 'Bole, near Airport Ring Road',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Bole',
        woreda: 'Woreda 09',
        water: true,
        electricity: true,
        internet: true,
        parking: true,
        security: true,
        furnished: true,
        swimmingPool: false,
        garden: false,
        ownershipStatus: 'Clean Title',
        propertyCondition: 'New',
      };
      onAddProperty({
        ...mockStudio,
        status: 'pending_review',
        isPremium: false,
        isFeatured: false,
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80']
      });

      botReplyText = currentLanguage === 'AM' 
        ? `🚀 *ምዝገባዎ በተሳካ ሁኔታ ተልኳል!*

የቤትዎ መረጃ በሲስተሙ ውስጥ "pending_review" ሆኖ ተመዝግቧል። ደላላው አጽድቆ ሲያወጣው በዌብሳይት እና አንድሮይድ ላይ ይታያል።`
        : `🚀 *Telegram Upload Successful!*
        
Your listing has been submitted as "pending_review" and routed to Habesha Elite Realty for verification. Once approved, it instantly syncs live on our Web Portal and Android App!`;
    } else {
      // Fallback response helper
      botReplyText = `I heard your message: "${userText}". 
      
Type one of our commands or tap on the keyboard buttons below to interact with the centralized real estate database.`;
    }

    const botMsg: BotMsg = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keyboard: botReplyKeyboard,
      propertyCard: matchedProp,
      brokerList: showBrokers,
    };

    setConversation(prev => [...prev, userMsg, botMsg]);
  };

  const handleSendMessageForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    triggerBotReply(typedCommand);
    setTypedCommand('');
  };

  return (
    <div id="telegram-bot-section" className="flex flex-col lg:flex-row items-center justify-center gap-10 py-4">
      
      {/* Left Column: Explanations */}
      <div className="max-w-sm space-y-4 text-center lg:text-left">
        <span className="bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-500/20 inline-flex items-center gap-1">
          <Bot className="w-3.5 h-3.5 animate-pulse" /> Telegram Bot Simulator
        </span>
        <h2 className="text-xl font-bold font-display text-slate-800">Ecosystem Bot Webhook</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The official Telegram Bot allowing users to query, browse, and upload listing specs directly via chat commands.
        </p>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left space-y-1.5 text-[11px] text-slate-600">
          <p className="font-bold text-slate-700">💡 Testing Commands:</p>
          <p>• Type <span className="font-mono bg-white px-1 py-0.2 rounded border">Bole</span> to look up our premium Bole Villa.</p>
          <p>• Type <span className="font-mono bg-white px-1 py-0.2 rounded border">/start</span> to reset conversation menus.</p>
          <p>• Select <span className="font-semibold text-slate-800">አማርኛ 🇪🇹</span> to translate menus into Amharic.</p>
        </div>
      </div>

      {/* Right Column: Telegram Web Client CSS Mockup */}
      <div className="relative">
        <div className="w-[320px] h-[580px] bg-slate-900 rounded-[32px] overflow-hidden border-[8px] border-slate-950 shadow-2xl flex flex-col relative font-sans">
          
          {/* Telegram Header */}
          <div className="bg-[#17212b] p-3.5 pb-2.5 flex items-center gap-3 border-b border-[#101921] text-white">
            <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center font-bold text-sm">
              E
            </div>
            <div>
              <p className="font-bold text-xs flex items-center gap-1">
                Ethiopia Property Hub <span className="w-3.5 h-3.5 bg-sky-500 rounded-full text-[8px] font-extrabold flex items-center justify-center">✓</span>
              </p>
              <span className="text-[10px] text-sky-400 font-medium">bot • active webhook</span>
            </div>
          </div>

          {/* Chat Messages Frame */}
          <div className="flex-1 bg-[#0e1621] p-3 overflow-y-auto space-y-3.5 flex flex-col">
            {conversation.map((msg) => (
              <div key={msg.id} className="space-y-2">
                
                {/* Bubble bubble layout */}
                <div className={`max-w-[85%] p-3 rounded-xl text-xs relative ${
                  msg.sender === 'user'
                    ? 'bg-[#2b5278] text-white ml-auto rounded-tr-none'
                    : 'bg-[#182533] text-[#f5f5f5] mr-auto rounded-tl-none border border-[#101921]'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* Inline Property spec card inside chat bubble */}
                  {msg.propertyCard && (
                    <div className="mt-2 bg-[#0e1621] rounded-lg overflow-hidden border border-slate-700/50 text-[#fff]">
                      <img src={msg.propertyCard.images[0]} alt="" className="h-24 w-full object-cover" referrerPolicy="no-referrer" />
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-[11px] truncate">{msg.propertyCard.title}</p>
                        <p className="text-[10px] font-extrabold text-sky-400 font-mono">{msg.propertyCard.currency} {msg.propertyCard.price.toLocaleString()}</p>
                        <p className="text-[8px] text-slate-400">Area: {msg.propertyCard.area} sqm • {msg.propertyCard.bedrooms} Bed</p>
                      </div>
                    </div>
                  )}

                  {/* Inline Brokers list inside chat bubble */}
                  {msg.brokerList && (
                    <div className="mt-2 space-y-1.5">
                      {msg.brokerList.map(b => (
                        <div key={b.id} className="p-2 bg-[#0e1621] rounded-lg border border-slate-800 text-[10px] flex items-center gap-2">
                          <img src={b.logo} alt="" className="w-6 h-6 rounded object-cover" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{b.companyName}</p>
                            <span className="text-[8px] text-slate-400">License: {b.licenseNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] opacity-40 block mt-1 text-right">
                    {msg.timestamp} <span className="text-sky-400">✓✓</span>
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Interactive Keyboard Panel */}
          {conversation[conversation.length - 1]?.keyboard && (
            <div className="bg-[#17212b] p-2 border-t border-[#101921] grid grid-cols-2 gap-1.5 z-30">
              {conversation[conversation.length - 1].keyboard?.map((keyLabel) => (
                <button
                  key={keyLabel}
                  onClick={() => triggerBotReply(keyLabel)}
                  className="py-1.5 bg-[#202b36] hover:bg-[#243341] text-[#79a3c6] text-[10px] font-semibold rounded-lg border border-[#2a3c4c] transition-colors"
                >
                  {keyLabel}
                </button>
              ))}
            </div>
          )}

          {/* Message Input textfield */}
          <form onSubmit={handleSendMessageForm} className="bg-[#17212b] p-2.5 border-t border-[#101921] flex gap-2">
            <input
              type="text"
              placeholder="Write a message or run command..."
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              className="flex-1 bg-[#202b36] border border-[#2a3c4c] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-white transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
