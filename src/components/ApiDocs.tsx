/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code, Database, Play, CheckCircle, HelpCircle, Key, Layers, Terminal, Server, FileText, RefreshCw } from 'lucide-react';

export default function ApiDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState<string>('GET /api/properties');
  const [responseLog, setResponseLog] = useState<any>(null);
  const [loadingRunner, setLoadingRunner] = useState(false);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/properties',
      desc: 'Retrieve all active, pending, or premium real estate properties in the synchronized database feed.',
      params: '?subCity=Bole&purpose=Rent'
    },
    {
      method: 'GET',
      path: '/api/brokers',
      desc: 'Fetch lists of certified, licensed agencies registered under the Ethiopia Property Hub network.',
      params: ''
    },
    {
      method: 'GET',
      path: '/api/admin/audit-logs',
      desc: 'Retrieve secure, real-time transaction and sync logs (Administrator access required).',
      params: ''
    },
    {
      method: 'GET',
      path: '/api/admin/settings',
      desc: 'View active Android maintenance mode variables and Telegram bot webhook status flags.',
      params: ''
    },
  ];

  const handleRunEndpoint = async (method: string, path: string) => {
    setLoadingRunner(true);
    setResponseLog(null);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResponseLog(data);
    } catch (err: any) {
      setResponseLog({ error: 'Failed to complete REST call.', details: err.message });
    } finally {
      setLoadingRunner(false);
    }
  };

  return (
    <div id="api-docs-section" className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800">
        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 w-max">
          <Terminal className="w-3.5 h-3.5" /> Developer REST Hub & ER Diagram
        </span>
        <h1 className="text-xl font-bold font-display mt-2">Ethiopia Property Hub Core API Engine</h1>
        <p className="text-xs text-slate-400 mt-1">Explore live database synchronization endpoints, schema maps, and run interactive REST calls.</p>
      </div>

      {/* ER Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Schema Column 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-sky-500" /> TABLE: Properties
          </h3>
          <div className="space-y-1.5 font-mono text-[10px] text-slate-600">
            <div className="flex justify-between border-b border-dashed pb-1"><span className="font-bold text-slate-800">id</span> <span className="text-slate-400">VARCHAR (PK)</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>title</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>price</span> <span className="text-slate-400">INTEGER</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>status</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>broker_id</span> <span className="text-slate-400">VARCHAR (FK)</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>is_premium</span> <span className="text-slate-400">BOOLEAN</span></div>
            <div className="flex justify-between pb-1"><span>images</span> <span className="text-slate-400">TEXT[]</span></div>
          </div>
        </div>

        {/* Schema Column 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-sky-500" /> TABLE: Brokers
          </h3>
          <div className="space-y-1.5 font-mono text-[10px] text-slate-600">
            <div className="flex justify-between border-b border-dashed pb-1"><span className="font-bold text-slate-800">id</span> <span className="text-slate-400">VARCHAR (PK)</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>company_name</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>license_number</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>status</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between pb-1"><span>rating</span> <span className="text-slate-400">NUMERIC</span></div>
          </div>
        </div>

        {/* Schema Column 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
            <Layers className="w-4 h-4 text-sky-500" /> TABLE: AuditLogs
          </h3>
          <div className="space-y-1.5 font-mono text-[10px] text-slate-600">
            <div className="flex justify-between border-b border-dashed pb-1"><span className="font-bold text-slate-800">id</span> <span className="text-slate-400">VARCHAR (PK)</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>action</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>details</span> <span className="text-slate-400">TEXT</span></div>
            <div className="flex justify-between border-b border-dashed pb-1"><span>user</span> <span className="text-slate-400">VARCHAR</span></div>
            <div className="flex justify-between pb-1"><span>timestamp</span> <span className="text-slate-400">TIMESTAMP</span></div>
          </div>
        </div>

      </div>

      {/* REST API Tester Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Left endpoint selector */}
        <div className="md:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Decentralized Webhooks & API Index</h3>
          
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <button
                key={ep.method + ep.path}
                onClick={() => {
                  setActiveEndpoint(ep.method + ' ' + ep.path);
                  setResponseLog(null);
                }}
                className={`w-full p-3 rounded-xl border text-left space-y-1 transition-all ${
                  activeEndpoint === (ep.method + ' ' + ep.path)
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-slate-800 font-bold">{ep.path}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{ep.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Runner panel */}
        <div className="md:col-span-7 bg-slate-900 text-slate-200 rounded-2xl p-5 flex flex-col h-[350px]">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono font-semibold text-slate-400 flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-emerald-400" /> Live Target: localhost:3000
            </span>
            
            <button
              onClick={() => {
                const ep = endpoints.find(e => (e.method + ' ' + e.path) === activeEndpoint);
                if (ep) {
                  handleRunEndpoint(ep.method, ep.path);
                }
              }}
              disabled={loadingRunner}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {loadingRunner ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-slate-950" />}
              Send Request
            </button>
          </div>

          {/* Response payload viewer */}
          <div className="flex-1 overflow-y-auto mt-3 font-mono text-[10px] text-emerald-400 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            {loadingRunner && (
              <p className="text-slate-400 animate-pulse">Executing HTTP connection handshake...</p>
            )}

            {!loadingRunner && !responseLog && (
              <p className="text-slate-500 italic">Click "Send Request" to trigger a real API transaction...</p>
            )}

            {!loadingRunner && responseLog && (
              <pre className="whitespace-pre-wrap leading-normal">
                {JSON.stringify(responseLog, null, 2)}
              </pre>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
